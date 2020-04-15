/// @dev Documentation: https://www.blockcypher.com/dev/bitcoin/

const axios = require('axios');
const RateLimiterProvider = require('./rate-limiter-provider');
const { addUrlParams, isBytes32Hex } = require('../utils');

class BlockcypherProvider extends RateLimiterProvider {
  constructor(...args) {
    super(...args);
  }

  get _baseUrl() {
    switch(this._network) {
      case 'main':
        return 'https://api.blockcypher.com/v1/btc/main';
      case 'test3':
        return 'https://api.blockcypher.com/v1/btc/test3';
      default:
        throw new Error('Invalid Network: ' + this._network);
    }
  }

  errorMessage(response) {
    /// add appropriate api error message
    return `Blockcypher Error: ${response.status}`;
  }

  async getLatestBlock() {
    return await this._rateLimiter(async() => {
      const response = await axios.get(addUrlParams(this._baseUrl, {token: this._apiKey}));
      if(response.data.error_code) throw new Error(errorMessage(response));
      return response.data;
    });
  }

  async getBlock(blockHashOrHeight) {
    if(typeof blockHashOrHeight !== 'number' || isBytes32Hex(blockHashOrHeight)) throw new Error('block height should be number or hex string: '+ blockHashOrHeight);

    if(typeof blockHashOrHeight === 'string' && blockHashOrHeight.slice(0,2) === '0x') blockHashOrHeight = blockHashOrHeight.slice(2);

    return await this._rateLimiter(async() => {
      const response = await axios.get(
        addUrlParams(this._baseUrl + '/blocks/' + blockHashOrHeight, {token: this._apiKey})
      );
      return response.data;
    });
  }

  async getBalance(address) {
    // add checks for valid network address
    return await this._rateLimiter(async() => {
      const response = await axios.get(
        addUrlParams(`${this._baseUrl}/addrs/${address}/balance`, {token: this._apiKey})
      );
      // if(response.data.error_code) throw new Error(errorMessage(response));
      return response.data.balance;
    });
  }

  async getTransactions(address, options = {}) {
    return await this._rateLimiter(async() => {
      // convert start time and end time into block height using getBlock
      const parameters = {};
      if(this._apiKey) parameters.token = this._apiKey;
      if(options.fromBlock) {
        if(isNaN(options.fromBlock)) throw new Error('Invalid fromBlock numeric: '+options.fromBlock);
        parameters.after = +options.fromBlock - 1;
      }
      if(options.toBlock && options.toBlock !== 'latest') {
        if(isNaN(options.toBlock)) throw new Error('Invalid toBlock numeric: '+options.toBlock);
        parameters.before = +options.toBlock + 1;
      }

      if(options.verbose) parameters.includeScript = true;

      const response = await axios.get(
        addUrlParams(`${this._baseUrl}/addrs/${address}`, parameters)
      );

      if(response.data.txrefs && (options.fromBlock || options.toBlock)) {
        response.data.txrefs = response.data.txrefs.filter(txref => {
          return options.fromBlock ? (options.fromBlock <= txref.block_height) : true
          && options.toBlock ? (txref.block_height <= options.toBlock) : true;
        });
      }
      return response.data.txrefs || [];
    });
  }
}

module.exports = BlockcypherProvider;

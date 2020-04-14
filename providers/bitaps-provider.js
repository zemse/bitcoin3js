// Documentation: https://developer.bitaps.com/blockchain

const axios = require('axios');
const rateLimiter = require('./rate-limiter');
const { isBytes32Hex } = require('../utils');

class BitapsProvider {
  /// @dev args can be an options object or network:string, apiKey:string arguments
  constructor(...args) {
    if(!args.length) {
      throw new Error('No arguments passed. Please at least pass network (e.g. main, test3...) as the first argument');
    }

    /// @dev if argument is an options object
    if(typeof args[0] === 'object') {
      const options = args[0];
      if(!options.network) throw new Error('network property is not present');
      this._network = options.network;
      this.baseUrl; /// @dev for checking valid network type
      if(options._apiKey) this.apiKey = options.network;
      if(options.requestsLimit || options.seconds) {
        if(!options.requestsLimit) throw new Error('requestsLimit property is not present');
        if(!options.seconds) throw new Error('seconds property is not present');
        this._rateLimiter = rateLimiter(options.requestsLimit, options.seconds);
      }
    } else {
      if(typeof args[0] !== 'string') throw new Error('network should be string');
      this._network = args[0];

      if(args[1]) {
        if(typeof args[1] !== 'string') throw new Error('apiKey should be string');
        this._apiKey = args[1];
      }
    }

    if(!this._rateLimiter) {
      this._rateLimiter = rateLimiter(15, 5);
    }
  }

  get baseUrl() {
    switch(this._network) {
      case 'main':
        return 'https://api.bitaps.com/btc/v1/blockchain';
      case 'test3':
        return 'https://api.bitaps.com/btc/testnet/v1/blockchain/';
      case 'ltc':
        return 'https://api.bitaps.com/ltc/v1/blockchain/';
      case 'tltc':
        return 'https://api.bitaps.com/ltc/testnet/v1/blockchain/';
      default:
        throw new Error('Invalid Network: '+this._network);
    }
  }

  errorMessage(response) {
    return `Bitaps Error: ${response.data.error_code} - ${response.data.message} - ${response.data.details}`;
  }

  async getBlockHeight() {
    const latestBlock = await this.getLatestBlock();
    return latestBlock.height;
  }

  /// @dev alias for getBlockHeight
  getBlockNumber() {
    return this.getBlockHeight();
  }

  async getLatestBlock() {
    return await this._rateLimiter(async() => {
      const response = await axios.get(this.baseUrl + '/block/last');
      if(response.data.error_code) throw new Error(errorMessage(response));
      return response.data.data.block;
    });
  }

  async getBlock(blockHashOrHeight) {
    if(typeof height !== 'number' || isBytes32Hex(blockHashOrHeight)) throw new Error('block height should be number or hex string');

    if(typeof blockHashOrHeight === 'string' && blockHashOrHeight.slice(0,2) === '0x') blockHashOrHeight = blockHashOrHeight.slice(2);

    return await this._rateLimiter(() => {
      return axios.get(this.baseUrl + '/block/'+blockHashOrHeight)
    });
  }

  async getBalance(address) {
    // add checks for valid network address
    return await this._rateLimiter(async() => {
      const response = await axios.get(this.baseUrl + '/address/state/' + address);
      if(response.data.error_code) throw new Error(errorMessage(response));
      return response.data.data.balance;
    });
  }
}

module.exports = BitapsProvider;

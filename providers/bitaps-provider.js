// Documentation: https://developer.bitaps.com/blockchain

const axios = require('axios');
const BaseProvider = require('./base-provider');
const { isBytes32Hex, addUrlParams } = require('../utils');

class BitapsProvider extends BaseProvider {
  /// @dev args can be an options object or network:string, apiKey:string arguments
  constructor(...args) {
    super(...args);
  }

  get _baseUrl() {
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

  async getLatestBlock() {
    return await this._rateLimiter(async() => {
      const response = await axios.get(this._baseUrl + '/block/last');
      if(response.data.error_code) throw new Error(errorMessage(response));
      return response.data.data.block;
    });
  }

  async getBlock(blockHashOrHeight) {
    if(typeof blockHashOrHeight !== 'number' || isBytes32Hex(blockHashOrHeight)) throw new Error('block height should be number or hex string: '+ blockHashOrHeight);

    if(typeof blockHashOrHeight === 'string' && blockHashOrHeight.slice(0,2) === '0x') blockHashOrHeight = blockHashOrHeight.slice(2);

    return await this._rateLimiter(() => {
      return axios.get(this._baseUrl + '/block/'+blockHashOrHeight)
    });
  }

  async getBalance(address) {
    // add checks for valid network address
    return await this._rateLimiter(async() => {
      const response = await axios.get(this._baseUrl + '/address/state/' + address);
      if(response.data.error_code) throw new Error(errorMessage(response));
      return response.data.data.balance;
    });
  }

  async getTransactions(address, options = {}) {
    return await this._rateLimiter(async() => {
      // convert start time and end time into block height using getBlock
      let start, end, limit = 100, mode = 'brief';

      if('startTime' in options) {
        start = options.startTime;
      } else if(options.fromBlock) {
        const block = await this.getBlock(options.fromBlock);
        start = block.blockTime;
      }

      if('endTime' in options) {
        end = options.endTime;
      } else if(options.toBlock) {
        const block = await this.getBlock(options.toBlock);
        end = block.blockTime;
      }

      if('verbose' in options) {
        if(typeof options.verbose !== 'boolean') throw new Error('Verbose should be boolean');
        if(options.verbose) {
          mode = 'verbose';
        }
      }

      let response;
      while(true) {
        response = await axios.get(
          addUrlParams(this._baseUrl + '/address/transactions/' + address, {
            start, end, limit, mode
          })
        );
        if(response.data.error_code) throw new Error(errorMessage(response));

        limit *= 10;
        if(response.data.data.pages === 1) break;
      }

      // console.log({response});

      return response.data.data.list;
    });
  }
}

module.exports = BitapsProvider;

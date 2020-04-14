const axios = require('axios');
const rateLimiter = require('./rate-limiter');

class BaseProvider {
  /// @dev args from extender class constructor
  constructor(...args) {
    this._lastBlockNumber = -1;

    this._pollingInterval = 30000;
    this._events = [];

    if(!args.length) {
      throw new Error('No arguments passed. Please at least pass network (e.g. main, test3...) as the first argument');
    }

    /// @dev if argument is an options object
    if(typeof args[0] === 'object') {
      const options = args[0];
      if(!options.network) throw new Error('network property is not present');
      this._network = options.network;
      this._baseUrl; /// @dev for checking valid network type
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

  /// @dev method dependent on blockcypher or bitaps getLatestBlock method
  async getBlockHeight() {
    const latestBlock = await this.getLatestBlock();
    return latestBlock.height;
  }

  /// @dev an alias for getBlockHeight
  async getBlockNumber() {
    return this.getBlockHeight();
  }

  /// @dev event mechanism
  on(event, callback) {
    switch(event) {
      case 'block':
        this.onBlock(callback);
        break;
      default:
        throw new Error(`event type '${event}' is not supported`);
        break;
    }
  }

  onBlock(callback) {
    const intF = async() => {
      const newBlockHeight = await this.getBlockHeight();
      if(this._lastBlockNumber < newBlockHeight && this._lastBlockNumber !== -1) {
        while(this._lastBlockNumber < newBlockHeight) {
          this._lastBlockNumber++;
          callback(this._lastBlockNumber);
        }
      }
    };
    const intervalId = setInterval(intF, this._pollingInterval);
    intF();

    this._events.push({
      type: 'new-block',
      intervalId,
      stopEvent: this.stopEvent.bind(this, this._events.length)
    });
  }

  stopEvent(index) {
    if(typeof index === 'number' && index < this._events.length) {
      clearInterval(this._events[index].intervalId);
      this._events.splice(index,1);
    } else {
      throw new Error('Invalid event index');
    }
  }
}

module.exports = BaseProvider;

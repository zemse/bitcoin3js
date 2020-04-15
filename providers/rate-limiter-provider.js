const EventsProvider = require('./events-provider');

class RateLimiterProvider extends EventsProvider {
  /// @dev args from extender class constructor
  constructor(...args) {
    super();

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
}

class RateLimiter {
  constructor(requestsLimit, seconds) {
    if(typeof requestsLimit !== 'number') throw new Error('requestsLimit should be number');
    if(typeof seconds !== 'number') throw new Error('seconds should be number');
    this._requestsLimit = requestsLimit;
    this._seconds = seconds;
    this._consumed = 0;
    this._promise = null;
    // setInterval(() => this._consumed = 0, seconds);
  }

  async call(callback) {
    if(this._promise) {
      await this._promise;
      return await call(callback);
    }

    if(this._consumed >= this._requestsLimit) {
      this._promise = new Promise(function(resolve, reject) {
        setTimeout(() => {
          this._promise = null;
          resolve();
        }, this._seconds);
      });
      return await call(callback);
    }

    this._consumed++;
    return await callback();
  }
}

function rateLimiter(requestsLimit, seconds) {
  const rateLimiterInstance = new RateLimiter(requestsLimit, seconds);
  return rateLimiterInstance.call;
}

module.exports = RateLimiterProvider;
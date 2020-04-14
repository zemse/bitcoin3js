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

module.exports = (requestsLimit, seconds) => {
  const rateLimiterInstance = new RateLimiter(requestsLimit, seconds);
  return rateLimiterInstance.call;
};

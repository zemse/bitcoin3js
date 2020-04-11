const axios = require('axios');

class BaseProvider {
  /// @dev engine is the provider engine object
  constructor(engine) {
    this._engine = engine;
    this._lastBlockNumber = -1;
    this._promises = [];

    this._promises.push(this.getBlockHeight());
    this._promises[0].then(value => {
      this._lastBlockNumber = value;
    });

    this._pollingInterval = 30000;
    this._events = [];
  }

  async getBlockHeight() {
    const response = await axios.get(this._engine.functions.blockHeight.url());
    const newBlockHeight = this._engine.functions.blockHeight.parse(response.data);
    if(newBlockHeight > this._lastBlockNumber) {
      this._lastBlockNumber = newBlockHeight;
    }
    return newBlockHeight;
  }

  async getBalance(address) {
    const response = await axios.get(this._engine.functions.balance.url(address));
    return this._engine.functions.balance.parse(response.data);
  }

  async getUtxos(address) {
    const response = await axios.get(this._engine.functions.utxos.url(address));
    return this._engine.functions.utxos.parse(response.data);
  }

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
      let lastBlockNumber = this._lastBlockNumber;
      const newBlockHeight = await this.getBlockHeight();
      if(newBlockHeight > lastBlockNumber && lastBlockNumber !== -1) {
        while(lastBlockNumber < newBlockHeight) {
          lastBlockNumber++;
          callback(lastBlockNumber);
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

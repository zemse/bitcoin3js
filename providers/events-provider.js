const BaseProvider = require('./base-provider');

class EventsProvider extends BaseProvider {
  constructor() {
    super();
    this._lastBlockNumber = -1;

    this._pollingInterval = 30000;
    this._events = [];
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
      if(this._lastBlockNumber === -1) {
        return this._lastBlockNumber = newBlockHeight;
      }
      if(this._lastBlockNumber < newBlockHeight) {
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

module.exports = EventsProvider;

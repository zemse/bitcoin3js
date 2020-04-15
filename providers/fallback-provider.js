const EventsProvider = require('./events-provider');
const BlockcypherProvider = require('./blockcypher-provider');
const BitapsProvider = require('./bitaps-provider');

/// @dev inheriting base provider for getting aliases
class FallbackProvider extends EventsProvider {
  constructor(providerArray, loadBalancer = true) {
    super();
    this._randomize = loadBalancer;
    if(!(providerArray instanceof Array)) throw new Error('Fallback constructor argument should be an array');

    if(!providerArray.length) throw new Error('providerArray should at least have one provider');

    let network;
    providerArray.forEach(provider => {
      if(!network) {
        network = provider._network;
      } else if(network !== provider._network) {
        throw new Error('All providers should have same networks');
      }

      const result = [BlockcypherProvider, BitapsProvider].find(providerClass => {
        return provider instanceof providerClass
      });

      if(typeof result === 'undefined') throw new Error('Members of provider array should be instances of BlockcypherProvider or BitapsProvider');
    });

    this._providerArray = providerArray;
  }

  /// @dev order of the array is randomized to disributed load
  get _randomizedProviderArray() {
    if(!this._randomize) {
      return this._providerArray;
    }

    const randomizedArray = [...this._providerArray];
    for(let i = 0; i < randomizedArray.length ** 2; i++) {
      const a = Math.floor(Math.random() * (randomizedArray.length));
      const b = Math.floor(Math.random() * (randomizedArray.length));
      const temp = randomizedArray[a];
      randomizedArray[a] = randomizedArray[b];
      randomizedArray[b] = temp;
    }

    return randomizedArray;
  }

  /// @dev implementation of fallback mechanism
  async _fallback(method, args = []) {
    for(const provider of this._randomizedProviderArray) {
      // console.log(provider.constructor);
      try {
        if(!provider[method]) continue;
        const output = await provider[method](...args);
        return output;
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    throw new Error('All providers failed');
  }

  /// @dev all implemented methods

  getLatestBlock() {
    return this._fallback('getLatestBlock');
  }

  getBlock(blockHashOrHeight) {
    return this._fallback('getBlock', [blockHashOrHeight]);
  }

  getBalance(address) {
    return this._fallback('getBalance',[address]);
  }

  getTransactions(address, options = {}) {
    return this._fallback('getTransactions', [address, options]);
  }


}

module.exports = FallbackProvider;

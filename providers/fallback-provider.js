const EventsProvider = require('./events-provider');
const BlockcypherProvider = require('./blockcypher-provider');
const BitapsProvider = require('./bitaps-provider');

/// @dev inheriting base provider for getting aliases
class FallbackProvider extends EventsProvider {
  constructor(providerArray, loadBalancer, moveOnDelay) {
    super();
    if(typeof loadBalancer === 'object') {
      const options = loadBalancer;
      this._randomize = 'loadBalancer' in options ? options.loadBalancer : true;
      this._moveOnDelay = 'moveOnDelay' in options ? options.moveOnDelay : 16000;
    } else {
      this._randomize = loadBalancer !== undefined ? loadBalancer : true;
      this._moveOnDelay = moveOnDelay !== undefined ? moveOnDelay : 16000;
    }

    if(typeof this._randomize !== 'boolean') throw new Error('option loadBalancer to the FallbackProvider should be of type boolean')
    if(typeof this._moveOnDelay !== 'number') throw new Error('option moveOnDelay to the FallbackProvider should be of type number')

    if(this._moveOnDelay && this._moveOnDelay < 200) {
      console.log(`\nWarning: moveOnDelay of ${this._moveOnDelay} ms is too low. This might cause unintented behaviour. If you meant ${this._moveOnDelay} sec, please multiply it with 1000 since javascript works with milli second time unit.\n`);
    }

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
    let movedOnPromises = [];
    let errors = [];
    for(const provider of this._randomizedProviderArray) {
      // console.log(provider.constructor);
      let outputPromise;
      try {
        if(!provider[method]) continue;

        if(this._moveOnDelay) {
          outputPromise = provider[method](...args);

          let timeoutId;
          const _this = this;
          const deplayPromise = new Promise(function(resolve, reject) {
            timeoutId = setTimeout(reject.bind(this, new Error('Too much delay, fallback is moving on to next provider')), _this._moveOnDelay);
          });

          const output = await Promise.race([outputPromise, deplayPromise]);
          // console.log('clear timeout');
          clearTimeout(timeoutId);
          return output;
        } else {
          return await provider[method](...args);
        }
      } catch (error) {
        // console.log(provider.constructor, error);
        errors.push(error);
        if(error.message.includes('Too much delay, fallback is moving on to next provider')) {
          // console.log('moving on');
          movedOnPromises.push(outputPromise);
        }
        continue;
      }
    }

    /// @dev below code is a replacement of Promise.any (which is still in Stage 3)
    ///   once it reaches stage 4, we can use that instead
    while(movedOnPromises.length) {
      const output = await Promise.race(movedOnPromises.map((promise, i) => {
        return new Promise(async function(resolve, reject) {
          try {
            const output = await promise;
            resolve(output);
          } catch(error) {
            movedOnPromises.splice(i,1);
            errors.push(error);
            resolve(null);
          }
        });
      }));
      if(output !== null) return output;
    }

    console.log('Errors:', errors);
    throw new Error('All providers failed');
  }

  /// @dev all implemented methods

  getLatestBlock() {
    return this._fallback('getLatestBlock');
  }

  getBlock(blockHashOrHeight) {
    return this._fallback('getBlock', [blockHashOrHeight]);
  }

  getBlocks(blockHashOrHeightArray) {
    return this._fallback('getBlocks', [blockHashOrHeightArray]);
  }

  getBalance(address) {
    return this._fallback('getBalance',[address]);
  }

  getTransactions(address, options = {}) {
    return this._fallback('getTransactions', [address, options]);
  }


}

module.exports = FallbackProvider;

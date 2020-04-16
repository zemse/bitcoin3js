const BlockcypherProvider = require('./blockcypher-provider');
const BitapsProvider = require('./bitaps-provider');
const FallbackProvider = require('./fallback-provider');

const getDefaultProvider = (network, apiKey = {}) => {
  let options = {};
  if(typeof network === 'string') {
    options.network = network;
    options.config = {
      blockcypher: {
        apiKey: apiKey.blockcypher
      }
    };
  } else if(typeof network === 'object') {
    options = network;
  }

  return new FallbackProvider([
    new BlockcypherProvider({
      network: options.network,
      apiKey: (options.config && options.config.blockcypher && options.config.blockcypher.apiKey)
        || 'a3c1aad4c151458da9b1fdee2a7fbdf3',
      requestsLimit: (options.config && options.config.blockcypher && options.config.blockcypher.requestsLimit)
        || 200,
      seconds: (options.config && options.config.blockcypher && options.config.blockcypher.seconds)
        || 60*60 // 1 hour
    }),
    new BitapsProvider({
      network: options.network,
      requestsLimit: (options.config && options.config.blockcypher && options.config.blockcypher.requestsLimit)
        || 15,
      seconds: (options.config && options.config.blockcypher && options.config.blockcypher.seconds)
        || 5 // 1 hour
    })
  ], {
    loadBalancer: options.loadBalancer || true,
    moveOnDelay: options.moveOnDelay || 16000
  })
};

module.exports = getDefaultProvider;

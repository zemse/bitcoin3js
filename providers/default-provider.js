const BlockcypherProvider = require('./blockcypher-provider');
const BitapsProvider = require('./bitaps-provider');
const FallbackProvider = require('./fallback-provider');

const getDefaultProvider = (network, apiKey = {}) => new FallbackProvider([
  new BlockcypherProvider({
    network: network,
    apiKey: apiKey.blockcypher || 'a3c1aad4c151458da9b1fdee2a7fbdf3',
    requestsLimit: 200,
    seconds: 60*60 // 1 hour
  }),
  new BitapsProvider({
    network: network,
    requestsLimit: 15,
    seconds: 5
  })
]);

module.exports = getDefaultProvider;

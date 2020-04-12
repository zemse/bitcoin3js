const bitcoin = require('bitcoinjs-lib');
const BaseProvider = require('./base-provider');

const addUrlParams = (url, params = {}) => {
  if(Object.keys(params).length > 0) {
    url += '?' + require('qs').stringify(params);
  }
  return url;
}

const engine = (network, apiKey) => {
  let networkProfile;
  let baseUrl;
  switch(network) {
    case 'btc':
      networkProfile = bitcoin.networks.bitcoin;
      baseUrl = 'https://api.blockcypher.com/v1/btc/main';
      break;
    case 'test3':
      networkProfile = bitcoin.networks.testnet;
      baseUrl = 'https://api.blockcypher.com/v1/btc/test3';
      break;
    default:
      networkProfile = bitcoin.networks.bitcoin;
      baseUrl = 'https://api.blockcypher.com/v1/btc/main';
      break;
  }
  return {
    name: 'blockcypher',
    network: networkProfile,
    functions: {
      blockHeight: {
        url: () => addUrlParams(baseUrl, {token: apiKey}),
        parse: apiOutput => {
          return apiOutput.height;
        }
      },
      block: {
        url: blockHashOrHeight => addUrlParams(`${baseUrl}/blocks/${blockHashOrHeight}`, {token: apiKey}),
        parse: apiOutput => {
          return apiOutput;
        }
      },
      balance: {
        url: address => addUrlParams(`${baseUrl}/addrs/${address}/balance`, {token: apiKey}),
        parse: apiOutput => {
          return apiOutput.balance;
        }
      },
      transactions: {
        url: (address, options = {}) => {
          const parameters = {};
          if(apiKey) parameters.token = apiKey;
          if(options.fromBlock) {
            if(isNaN(options.fromBlock)) throw new Error('Invalid fromBlock numeric: '+options.fromBlock);
            parameters.after = +options.fromBlock - 1;
          }
          if(options.toBlock && options.toBlock !== 'latest') {
            if(isNaN(options.toBlock)) throw new Error('Invalid toBlock numeric: '+options.toBlock);
            parameters.before = +options.toBlock + 1;
          }
          if(options.confirmations) parameters.confirmations = options.confirmations;
          if(options.confidence) parameters.confidence = options.confidence;
          if(options.unspentOnly) parameters.unspentOnly = options.unspentOnly;
          if(options.includeScript) parameters.includeScript = options.includeScript;
          if(options.includeConfidence) parameters.includeConfidence = options.includeConfidence;
          return addUrlParams(`${baseUrl}/addrs/${address}`, parameters);
        },
        parse: (apiOutput, options = {}) => {
          if(apiOutput.txrefs && (options.fromBlock || options.toBlock)) {
            apiOutput.txrefs = apiOutput.txrefs.filter(txref => {
              return options.fromBlock ? (options.fromBlock <= txref.block_height) : true
              && options.toBlock ? (txref.block_height <= options.toBlock) : true;
            });
          }
          return apiOutput.txrefs || [];
        }
      },
      utxos: {
        url: address => addUrlParams(`${baseUrl}/addrs/${address}/full`, {
          token: apiKey,
          unspentOnly: true,
          includeHex: true
        }),
        parse: (apiOutput, userAddress) => {
          const address = apiOutput.data.address || userAddress;
          const unspent = [];
          apiOutput.data.txs.forEach(tx => {
            const hash = tx.hash;
            let hex = tx.hex;
            const confirmed = tx.confirmed;
            console.log(tx.outputs);
            tx.outputs.forEach((out, index) => {
              console.log(out.addresses.includes(address));
              if(out.addresses.includes(address)) {
                unspent.push({
                  value: out.value,
                  hash,
                  hex,
                  confirmed,
                  index
                })
              }
            });
          });
          return unspent;
        }
      },
      txPush: {
        url: () => addUrlParams(`${baseUrl}/txs/push`, {token: apiKey}),
        body: hex => {tx: hex},
        parse: apiOutput => {
          return apiOutput
        }
      }
    }
  }
};

class BlockcypherProvider extends BaseProvider {
  constructor(network, apiKey) {
    super(engine(network, apiKey));
  }
}

module.exports = BlockcypherProvider;

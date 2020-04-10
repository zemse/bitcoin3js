const bitcoin = require('bitcoinjs-lib');
const BaseProvider = require('./base-provider');

const engine = (network, apiKey) => {
  let networkProfile;
  switch(network) {
    case 'btc':
      networkProfile = bitcoin.networks.bitcoin;
    case 'test3':
      networkProfile = bitcoin.networks.testnet;
    default:
      networkProfile = bitcoin.networks.bitcoin;
  }
  return {
    name: 'blockcypher',
    network: networkProfile,
    functions: {
      blockHeight: {
        url: () => 'https://api.blockcypher.com/v1/btc/test3',
        parse: apiOutput => {
          return apiOutput.height;
        }
      },
      balance: {
        url: address => `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`,
        parse: apiOutput => {
          return apiOutput.balance;
        }
      },
      utxos: {
        url: address => `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full?token=c29426c605e541bea307de3a54d94fcf&unspentOnly=true&includeHex=true`,
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
        url: () => `https://api.blockcypher.com/v1/btc/test3/txs/push${apiKey ? `?token=${apiKey}` : ''}`,
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

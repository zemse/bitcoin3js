const assert = require('assert');
const bitcoin = require('../../');

describe('Default Provider', () => {
  let provider;

  it('should create an instance', async() => {
    provider = bitcoin.getDefaultProvider('test3', {blockcypher: 'a3c1aad4c151458da9b1fdee2a7fbdf3'});

    assert.ok(provider instanceof bitcoin.providers.FallbackProvider, 'should be an instance of Blockcypher provider');
  });

  it('should create an instance with options object', async() => {
    const options = {
      network: 'test3',
      config: {
        blockcypher: {
          apiKey: 'a3c1aad4c151458da9b1fdee2a7fbdf3',
          requestsLimit: 10,
          seconds: 70
        },
        bitaps: {
          requestsLimit: 10,
          seconds: 70
        }
      }
    };

    provider = bitcoin.getDefaultProvider(options);

    assert.equal(provider._providerArray[0]._apiKey, options.config.blockcypher.apiKey, 'blockcyper api key should be set');

    assert.ok(provider instanceof bitcoin.providers.FallbackProvider, 'should be an instance of Blockcypher provider');
  });

  let height;
  it('should resolve current block height', async() => {
    height = await provider.getBlockHeight();

    assert.equal(typeof height, 'number', 'should be a number');
    assert.ok(!isNaN(height), 'should not be NaN');
    assert.ok(height > 1697056, 'height should be correct');
  });

  it('alias getBlockNumber for getBlockHeight should work', async() => {
    const blockNumber = await provider.getBlockNumber();
    assert.equal(blockNumber, height);
  });

  it('should fetch latest block', async() => {
    const block = await provider.getLatestBlock();
    assert.ok(block.height > 0, 'fetched block should have positive block height');
  })

  it('should fetch block', async() => {
    const block = await provider.getBlock(1234);
    assert.equal(block.height, 1234, 'fetched block should have correct block height');
  });

  it('should fetch block list', async() => {
    const numberList = [12, 34];
    const blockList = await provider.getBlocks(numberList);
    // console.log(blockList);
    assert.ok(blockList instanceof Array, 'output should be array');
    blockList.forEach((block, i) => {
      assert.equal(block.height, numberList[i], 'fetched block should have correct block height');
    })
  });

  it('should fetch balance', async() => {
    const balance = await provider.getBalance('mwcxXm4jwz1K2hsrUJkbJ1YASC8Z4Vf4yB');

    assert.equal(typeof balance, 'number', 'balance should be a number');
  });

  it('onblock initiate and stop', async() => {
    provider._pollingInterval = 1000;
    provider.on('block', blockNumber => {
      console.log('callback', blockNumber);
    });

    // to test the actual callbacks, we will need something like ganache
    assert(provider._events.length === 1, 'active event should be added');
    assert(provider._events[0].type === 'new-block', 'on-block event should be mentioned');

    provider._events[0].stopEvent();

    assert(provider._events.length === 0, 'event should be stopped');
  });

  it('fetch transactions for address', async() => {
    const transactions = await provider.getTransactions('mn8aHyjKxMoh4cPP1EUYZSpRSt1SoW7Wus', {
      fromBlock: 1697329,
      toBlock: 1697434
    });
    assert.equal(transactions.length, 3, 'there should be three transactions');
  });
});

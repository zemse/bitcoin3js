const assert = require('assert');
const bitcoin = require('../../');

describe('Blockcypher Provider', () => {
  let provider;

  it('should create an instance', async() => {
    provider = new bitcoin.providers.BlockcypherProvider('test3', 'a3c1aad4c151458da9b1fdee2a7fbdf3');
    assert.ok(provider instanceof bitcoin.providers.BlockcypherProvider, 'should be an instance of Blockcypher provider');

    assert.ok(provider._engine, 'should have an engine');
    assert.equal(provider._engine.name, 'blockcypher', 'name should be correct');
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
    const transactions = await provider.getTransactions('mwcxXm4jwz1K2hsrUJkbJ1YASC8Z4Vf4yB', {
      fromBlock: 1697117,
      toBlock: 1697117
    });
    assert.equal(transactions.length, 1, 'there should be one transaction');
  });
});

const assert = require('assert');
const bitcoin = require('../../');

describe('Bitaps Provider', () => {
  let provider;

  it('should create an instance through simple arguments', async() => {
    provider = new bitcoin.providers.BitapsProvider('test3');

    assert.equal(provider._network, 'test3');
  });

  it('should create an instance through options object', () => {
    provider = new bitcoin.providers.BitapsProvider({
      network: 'test3'
    });

    assert.equal(provider._network, 'test3');
  });


  let height;
  it('should resolve current block height', async() => {
    height = await provider.getBlockHeight();

    assert.ok(height !== undefined);
    assert.equal(typeof height, 'number', 'should be a number');
    assert.ok(!isNaN(height), 'should not be NaN');
    assert.ok(height > 1697056, 'height should be correct');
  });

  it('alias getBlockNumber for getBlockHeight should work', async() => {
    const blockNumber = await provider.getBlockNumber();

    assert.ok(blockNumber !== undefined);
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
    
    assert.ok(blockList instanceof Array, 'output should be array');
    blockList.forEach((block, i) => {
      assert.equal(block.height, numberList[i], 'fetched block should have correct block height');
    })
  });

  it('should fetch balance', async() => {
    const balance = await provider.getBalance('mwcxXm4jwz1K2hsrUJkbJ1YASC8Z4Vf4yB');

    assert.equal(typeof balance, 'number', 'balance should be a number');
  });

  it('fetch transactions for address', async() => {
    const transactions = await provider.getTransactions('mwcxXm4jwz1K2hsrUJkbJ1YASC8Z4Vf4yB', {
      fromBlock: 1697117,
      toBlock: 1697117,
      // verbose: true
    });

    assert.ok(transactions.length >= 1, 'there should be one transaction');
  });
});

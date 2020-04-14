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

  it('should fetch balance', async() => {
    const balance = await provider.getBalance('mwcxXm4jwz1K2hsrUJkbJ1YASC8Z4Vf4yB');

    assert.equal(typeof balance, 'number', 'balance should be a number');
  });
});

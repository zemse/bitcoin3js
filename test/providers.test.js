const assert = require('assert');
const bitcoin = require('../');

describe('Blockcypher Provider', () => {
  it('should create an instance', async() => {
    const provider = new bitcoin.providers.BlockcypherProvider('test3');

    assert.ok(provider instanceof bitcoin.providers.BlockcypherProvider, 'should be an instance of Blockcypher provider');

    assert.ok(provider._engine, 'should have an engine');
    assert.equal(provider._engine.name, 'blockcypher', 'name should be correct');
  });

  it('should resolve current block height', async() => {
    const provider = new bitcoin.providers.BlockcypherProvider('test3');

    console.log({provider});
    const height = await provider.getBlockHeight();

    console.log({provider});

    assert.equal(typeof height, 'number', 'should be a number');
    assert.ok(!isNaN(height), 'should not be NaN');
    assert.ok(height > 1697056, 'height should be correct');
  });
});

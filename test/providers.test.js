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
    const height = await provider.getBlockHeight();

    assert.equal(typeof height, 'number', 'should be a number');
    assert.ok(!isNaN(height), 'should not be NaN');
    assert.ok(height > 1697056, 'height should be correct');
  });

  it('onblock initiate and stop', async() => {
    const provider = new bitcoin.providers.BlockcypherProvider('test3');
    provider.on('block', console.log);
    assert(provider._events.length === 1, 'active event should be added');
    assert(provider._events[0].type === 'new-block', 'on-block event should be mentioned');

    provider._events[0].stopEvent();

    assert(provider._events.length === 0, 'event should be stopped');
  });
});

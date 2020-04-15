const assert = require('assert');
const { BlockcypherProvider, BitapsProvider } = require('../../providers');

describe('Provider Output Consistency', () => {
  let blockcypher, bitaps;

  it('should create instances', () => {
    blockcypher = new BlockcypherProvider('test3');
    bitaps = new BitapsProvider('test3');
  });

  it('should have same getLatestBlock output', async() => {
    const blockcypherB = await blockcypher.getLatestBlock();
    const bitapsB = await bitaps.getLatestBlock();

    assert.deepEqual(blockcypherB, bitapsB, 'lastest block output of both providers should be same');
  });

  it('should have same getBlock output', async() => {
    const blockcypherB = await blockcypher.getBlock(1234);
    const bitapsB = await bitaps.getBlock(1234);

    assert.deepEqual(blockcypherB, bitapsB, 'block output of both providers should be same');
  });

  it('should have same getTransactions output', async() => {
    const blockcypherTxs = await blockcypher.getTransactions('mn8aHyjKxMoh4cPP1EUYZSpRSt1SoW7Wus', {
      fromBlock: 1697329,
      toBlock: 1697434
    });
    const bitapsTxs = await bitaps.getTransactions('mn8aHyjKxMoh4cPP1EUYZSpRSt1SoW7Wus', {
      fromBlock: 1697329,
      toBlock: 1697434
    });

    assert.deepEqual(blockcypherTxs, bitapsTxs, 'transactions output of both providers should be same');
  });
});

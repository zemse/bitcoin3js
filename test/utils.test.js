const assert = require('assert');
const bitcoin = require('../');
const ethers = require('ethers');

describe('Utils Testing', () => {
  it('should give a valid WIF from Private Key', () => {
    const privateKey = '0x28f054978312636940dad639fb5d34641e40bec45e705dbaef4adbdd2d620ec8';
    const wif = bitcoin.utils.getWifFromPrivateKey(privateKey);
    assert.ok(typeof wif === 'string', 'wif should be a string');
  });
});

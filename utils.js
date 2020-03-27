const bitcoin = require('bitcoinjs-lib');
const bs58 = require('bs58');
const axios = require('axios');
const ethers = require('ethers');

const networkObj = network => network === 'mainnet'
  ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

function getWifFromPrivateKey(privateKey, network) {
  const extendedPrivateKey = ethers.utils.hexlify(ethers.utils.concat([
    '0x' + networkObj(network).wif.toString(16),
    privateKey.toString('hex'),
    '0x01'
  ]));
  const doubleShaOfExPr = ethers.utils.sha256(ethers.utils.sha256(extendedPrivateKey));

  const extendedPrivateKeyWithChecksum = ethers.utils.hexlify(ethers.utils.concat([
    extendedPrivateKey, doubleShaOfExPr.slice(0,10)
  ]));
  // console.log({extendedPrivateKeyWithChecksum});

  const extendedPrivateKeyWithChecksumBs58 = bs58.encode(
    ethers.utils.arrayify(extendedPrivateKeyWithChecksum)
  );

  // console.log({ extendedPrivateKeyWithChecksum, extendedPrivateKeyWithChecksumBs58});
  return extendedPrivateKeyWithChecksumBs58;
}

function getAddressFromWif(wif, network) {
  const bitcoinWallet = bitcoin.ECPair.fromWIF(wif, networkObj(network));

  const { address } = bitcoin.payments.p2pkh({
    pubkey: bitcoinWallet.publicKey,
    network: networkObj(network)
  });

  return address;
}

function getAddressFromPrivateKey(privateKey, provider) {
  const network = provider.network;
  return getAddressFromWif(getWifFromPrivateKey(privateKey, network), network);
}

async function fetchBalanceFromAddress(address, provider) {
  const url = provider.functions.balance.getBalanceUrl(address);
  try {
    const output = await axios.get(url);
    const balance = provider.functions.balance.parseBalanceFromApiOutput(output.data);
    if(balance !== null) {
      return balance;
    } else {
      return `Empty Response from ${provider.name}`;
    }
  } catch (error) {
    return `${provider.name} Network Error`;
  }

}

async function fetchBalanceFromPrivateKey(privateKey, provider) {
  const address = getAddressFromPrivateKey(privateKey, provider);
  return await fetchBalanceFromAddress(address, provider);
}

module.exports = {
  getWifFromPrivateKey, getAddressFromWif, getAddressFromPrivateKey, fetchBalanceFromAddress, fetchBalanceFromPrivateKey
};

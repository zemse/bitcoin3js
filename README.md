# Bitcoin3js

[![Node.js CI](https://github.com/zemse/bitcoin3js/workflows/Node.js%20CI/badge.svg)](https://github.com/zemse/bitcoin3js/workflows/Node.js%20CI/badge.svg)

Intends to be a complete Bitcoin Provider and Wallet Implementation. Currently, under development.

## Installing

You can install Bitcoin3js in your project using npm.

```shell
npm install bitcoin3js
```

## Quick Start with Provider

```javascript
const bitcoin = require('bitcoin3js');
const provider = bitcoin.getDefaultProvider('test3');

// get latest block height
const blockNumber = await provider.getBlockHeight();

// get block by block height
const block = await provider.getBlock(1234);

// fetch balances in satoshis
const balance = await provider.getBalance('mwcxXm4jwz1K2hsrUJkbJ1YASC8Z4Vf4yB');

// get transactions of an address
const transactions = await provider.getTransactions('mwcxXm4jwz1K2hsrUJkbJ1YASC8Z4Vf4yB', {
  fromBlock: 1697117,
  toBlock: 1697117
});

// add an event
provider.on('block', blockNumber => {
  // do something
});
```

## Providers

A provider instance is used to interact with the Bitcoin blockchain. Currently, there is integration of Blockcypher and Bitaps APIs.

### Constructing a Provider Instance
```javascript
const blockcypher = new bitcoin.providers.BlockcypherProvider('test3');
// or
const bitaps = new bitcoin.providers.BitapsProvider('test3');
// network: 'main' for bitcoin main network, 'test3' for bitcoin test network
```

### Rate Limiters

 Due to the presence of rate limits in the api providers, Bitcoin3js providers come with inbuilt rate limiters. You don't have to do anything. Though, you can customize the rate limiting variables.

```javascript
const { BlockcypherProvider } = require('bitcoin3js/providers');

const blockcypher = new BlockcypherProvider({
  network: network,
  apiKey: 'a3c1aad4c151458da9b1fdee2a7fbdf3',
  requestsLimit: 200,
  seconds: 60*60 // 1 hour
});
```
### Fallback Providers
Fallback Provider aggregates multiple provider objects into one provider object and in event of the failure of one provider, it utilises other provider. It can also be used for load balancing between multiple providers.

```javascript
const { FallbackProvider } = require('bitcoin3js/providers');

const provider = new FallbackProvider([ blockcypher, bitaps ]);
```

The `getDefaultProvider` demonstrated in the beginning is a `FallbackProvider` with providers `blockcypher` and `bitmaps`.

## About

I've started this project mainly because couldn't find a reliable project related to bitcoin API providers. Definitely, there are plenty of online resources made available by providers like Blockcypher to work with Bitcoin APIs and most of the projects rely with a single API provider. If you're building a project which needs a reliable source of information, provider downtime is a factor to consider. Your project would have to rely that the provider will be online 100%, which of course might not be always possible. If you are ready to go few miles ahead, you need to do a complicated setup to rely on multiple API providers so that single point of failure won't be an issue. And from above you can see, the `FallbackProvider` is what that solves this problem.

### Further Roadmap:

- More provider functionalities to be integrated
- More provider apis to be integrated
- Essential helper methods to work in Bitcoin Ecosystem
- Wallet

Roadmap will be updated as development will follow. Any suggestions or contributions are welcome.

# Bitcoin3js

> Under Development

Intends to be a complete Bitcoin Provider and Wallet Implementation.

```javascript
const bitcoin = require('bitcoin3js');
const provider = new bitcoin.providers.BlockcypherProvider('test3', 'c29426c605e541bea307de3a54d94fcf');

// fetch balances in satoshis
const balance = await provider.getBalance('mwcxXm4jwz1K2hsrUJkbJ1YASC8Z4Vf4yB');

provider.on('block', blockNumber => {
  //do something
});

```

Roadmap:
bitcoin
  utils => containing common utility functions

  Provider constructor => create an instance to interact with blockchain
    get network obj
    get blocknumber
    get balance
    get utxos
    get transaction
    get transaction fee rate
    generate transaction confirmation promise with number of confirmations
    events
      customizable pooling interval
      on balance change
      on transaction received

  Wallet constructor => create an instance which would have following methods
    get balance, create transaction, sign transactions, push transaction

# Bitcoin-js
Complete Bitcoin Wallet and Provider Implementation.

Plan:
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
    get balance

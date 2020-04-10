const axios = require('axios');

class BaseProvider {
  /// @dev engine is the provider engine object
  constructor(engine) {
    this._engine = engine;
  }

  async getBlockHeight() {
    const response = await axios.get(this._engine.functions.blockHeight.url());
    return this._engine.functions.blockHeight.parse(response.data);
  }

  async getBalance(address) {
    const response = await axios.get(this._engine.functions.balance.url(address));
    return this._engine.functions.balance.parse(response.data);
  }

  async getUtxos(address) {
    const response = await axios.get(this._engine.functions.utxos.url(address));
    return this._engine.functions.utxos.parse(response.data);
  }
}

module.exports = BaseProvider;

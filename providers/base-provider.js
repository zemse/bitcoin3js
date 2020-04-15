class BaseProvider {
  /// @dev method dependent on blockcypher or bitaps getLatestBlock method
  async getBlockHeight() {
    const latestBlock = await this.getLatestBlock();
    return latestBlock.height;
  }

  /// @dev an alias for getBlockHeight
  async getBlockNumber() {
    return this.getBlockHeight();
  }
}

module.exports = BaseProvider;

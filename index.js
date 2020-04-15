const utils = require('./utils');
const { version } = require('./package.json');

const providers = require('./providers');
const { getDefaultProvider } = providers;

module.exports = {
  utils,
  version,
  providers,
  getDefaultProvider,
};

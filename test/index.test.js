const assert = require('assert');
const bitcoin = require('../');

describe('Library Initialization', () => {
  it('should have a version number', () => {
    const version = bitcoin.version;

    assert.ok(typeof version === 'string', 'version should be defined as string');
    assert.ok(
      version.split('.').length >= 3,
      'version should be in Semantic Versioning format (https://semver.org/)'
    );
  });
});

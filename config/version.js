// load package.json for the version
var pkg = require('../package.json');
var git = require('git-rev');

/**
 * Loads version information about the currently deployed
 * code base.
 */
module.exports = {

  init: function (cb) {
    var self = this;
    git.short(function (str) {
      self._version.gitShort = str;
      git.long(function (str) {
        self._version.gitLong = str;
        cb(self._version);
      });
    });
  },

  _version: {
    version: pkg.version,
    gitLong: null,
    gitShort: null
  },

  version: function () {
    if (this._version.gitLong === null) {
      this.init(function (v) {
        // got git stats!
      });
    }
    return this._version;
  }

};

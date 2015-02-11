console.log('Loading... ', __filename);

// load package.json for the version
var pkg = require('../package.json');
var git = require('git-rev');
var _ = require('underscore');

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

  // internal representation of the version information
  _version: {
    version: pkg.version,
    gitLong: null,
    gitShort: null
  },

  version: function (cb) {
    // if initialization hasn't happen, initialize
    if (this._version.gitLong === null) {
      this.init(function (v) {
        // got git stats!
        if (!_.isUndefined(cb)) {
          cb(v);
        }
      });
      // if a callback is requested, let them know it is in process
      if (!_.isUndefined(cb)) {
        return null;
      }
    }
    // if we get to this point, init has completed and
    // can immediately callback
    if (!_.isUndefined(cb)) {
      return cb(this._version);
    }
    // otherwise, there's no callback and init may or may not have occurred
    // if init has not occurred, return whatever we have (means git fields will be null)
    return this._version;
  }

};

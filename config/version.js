// load package.json for the version
var pkg = require('../package.json');
var git = require('git-rev');
var rev = {
  version: pkg.version,
  gitLong: null,
  gitShort: null
};
git.short(function (str) {
  rev.gitShort = str;
});
git.long(function (str) {
  rev.gitLong = str;
})

/**
 * Loads version information about the currently deployed
 * code base.
 */
module.exports = {

  version: rev

};

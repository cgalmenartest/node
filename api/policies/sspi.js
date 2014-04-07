/**
* Add userId into params for knowing who created them.
*/
var _ = require('underscore');
var request = require('request');
var passport = require('passport');
var userUtils = require('../services/utils/user');

module.exports = function sspi (req, res, next) {
  // helper function that parses the domain and user value out of the credentials included in the header
  var parseCredentialHeader = function (key) {
    key = key || '';
    var domain = '';
    var user = '';
    var parts = key.split('\\');
    if (typeof parts[0] !== 'undefined')
      domain = parts[0];
    if (typeof parts[1] !== 'undefined')
      user = parts[1] + '@' + sails.config.auth.auth.sspi.emailDomain;
    return {
      domain: domain,
      user: user
    };
  };
  // helper function that processes SSPI credentials passed into the header
  var authenticateSSPIUser = function () {
    var credentials = parseCredentialHeader(req.headers[sails.config.auth.auth.sspi.header]);
    var username = credentials.user;
    var domain = credentials.domain;
    var password = sails.config.auth.auth.sspi.globalPass;

    req.sspi = {
      credentials: credentials,
      user: username,
      domain: domain
    };
    // try to authenticate with SSPI
    passport.authenticate('sspi', function (err, user, info)
    {
      if ((err) || (!user))
      {
        sails.log.error('SSPI Authentication Error:', err);
        return res.send(500, { message: "An internal error occurred while trying to authenticate.  Please try again later.", error: err });
      }
      // log in the authenticated user
      req.logIn(userUtils.cleanUser(user), function(err)
      {
        sails.log.debug('SSPI Login User:', user);
        if (err) {
          sails.log.debug('SSPI Authentication Error:', err, null);
          return res.send(403, {
            error: err,
            message: info.message
          });
        }
        // if (typeof req.user != 'array')
        // {
        //   req.user = [req.user];
        // }
        return next();
      });
    })(req, res, function (err) {
      if (err) {
        sails.log.error('Authentication Error:', err);
        return res.send(500, { message: "An internal error occurred while trying to authenticate.  Please try again later.", error: err });
      }
    });
  };
  // Check if SSPI is enabled; if so, process.  If not, continue to the
  // next middleware policy
  if ((sails.config.auth.auth.sspi.enabled === true) && !req.isAuthenticated()) {
    authenticateSSPIUser();
  }
  else{
    return next();
  }
};

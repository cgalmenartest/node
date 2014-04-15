/**
* Add userId into params for knowing who created them.
*/
var _ = require('underscore');
var passport = require('passport');
var userUtils = require('../services/utils/user');

module.exports = function sspi (req, res, next) {
  // helper function that parses the domain and user value out of the credentials included in the header
  var parseCredentialHeader = function (key) {
    key = key || '';
    key = key.trim();
    var result = {
      key: key
    };
    var parts = key.split('\\');
    if (typeof parts[0] !== 'undefined') {
      result.domain = parts[0];
    }
    if (typeof parts[1] !== 'undefined') {
      result.rawUser = parts[1];
      result.user = parts[1] + '@' + sails.config.auth.auth.sspi.emailDomain;
    }
    return result;
  };
  // helper function that processes SSPI credentials passed into the header
  var authenticateSSPIUser = function () {
    req.sspi = parseCredentialHeader(req.headers[sails.config.auth.auth.sspi.header]);
    // var password = sails.config.auth.auth.sspi.globalPass;

    // overwrite req.body to send username and password to passport for auth
    req.body = req.body || {};
    req.body.username = req.sspi.user;
    req.body.password = req.sspi.domain;
    sails.log.debug('SSPI req.sspi', req.sspi);
    sails.log.debug('SSPI Body', req.body);
    // try to authenticate with SSPI
    passport.authenticate('sspi', function (err, user, info)
    {
      sails.log.debug('SSPI Auth Error:', err);
      sails.log.debug('SSPI Auth User:', user);
      sails.log.debug('SSPI Auth Info:', info);
      if (err) {
        sails.log.error('SSPI Authentication Error:', err);
        return res.send(500, { message: "An internal error occurred while trying to authenticate.  Please try again later.", error: err });
      }
      // the account must be disabled
      if (!user) {
        req.alert = info;
        return next();
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
        if (typeof req.user != 'array')
        {
          req.user = [req.user];
        }
        return next();
      });
    })(req, res, function (err) {
      sails.log.debug("SSPI Final Error:", err);
      if (err) {
        sails.log.error('SSPI Authentication Error:', err);
        return res.send(500, { message: "An internal error occurred while trying to authenticate.  Please try again later.", error: err });
      }
    });
  };
  // Check if SSPI is enabled; if so, process.  If not, continue to the
  // next middleware policy
  if ((sails.config.auth.auth.sspi.enabled === true) && !req.isAuthenticated()) {
    authenticateSSPIUser();
  }
  else {
    return next();
  }
};

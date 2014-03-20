/**
* Add userId into params for knowing who created them.
*/
var _ = require('underscore');
var request = require('request');
var passport = require('passport');
var userUtils = require('../services/utils/user');


module.exports = function sspi (req, res, next) {
  // helper function that parses the domain and user value out of the credentials included in the header
  function parseCredentialHeader (key) {
    key = key || '';
    var domain = '';
    var user = '';
    var parts = key.split('\\');
    if(typeof parts[0] !== 'undefined')
      domain = parts[0];
    if(typeof parts[1] !== 'undefined')
      user = parts[1] + '@' + sails.config.auth.auth.sspi.emailDomain;
    return {domain:domain, user:user};
  }
  // helper function that processes SSPI credentials passed into the header
  function authenticateSSPIUser () {
    var credentials = parseCredentialHeader(req.headers[sails.config.auth.auth.sspi.header]);
    var username = credentials.user;
    var domain = credentials.domain;
    var password = sails.config.auth.auth.sspi.globalPass;


    request.get(
      {
        url: 'http://localhost:1337/api/auth/sspi',
        json:true,
        qs: { username: username, password: password, json:true /*, req: req, res: res*/ }
      },
      function (err, req2, user) {
        if (err) {
          return res.send(403, {message: "SSPI failed to recognize and authenticate the user."});
        }
        else {
          req.logIn(userUtils.cleanUser(user), function(err)
          {
            sails.log.debug(user);
            if (err) {
              sails.log.debug('Authentication Error:', err, null);
                return res.send(403, {
                  error: err,
                  message: info.message
                });
            }
            else {
              if(typeof req.user != 'array')
              {
                req.user = [req.user];
              }
              return next();
            }
          });
        }
      }
    );
  }
  if (sails.config.auth.auth.sspi.isEnabled && !req.isAuthenticated()) {
    authenticateSSPIUser();
  }
  else{
    return next();
  }
};
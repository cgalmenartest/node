/**
* Allow any authenticated user.
*/
var request = require('request');

module.exports = function authenticated (req, res, next) {
  // helper function for parsing SSPI credential into username and domain
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
    request.post({url: 'http://localhost:1337/api/auth/sspi',
                 json:true,
                 form: { username: username, password: domain }
                }, function (err, req, user) {
      if (err) {
        return res.send(403, {message: "You are not permitted to perform this action."});
      }
      else {
        return next();
      }
    });
  }

  if (sails.config.auth.auth.sspi.isEnabled && !req.isAuthenticated()) {
    authenticateSSPIUser();
  }
  else {
    // If the request is a GET, allow anyone to access.
    // Authenticated User is allowed to proceed to controller for all other operations
    if (req.isAuthenticated() || req.route.method === 'get') {
      return next();
    }
    else {
      // Could redirect the user, although most routes are APIs
      // since backbone handles the user views
      // res.redirect('/auth')
      // User is not allowed, send 403 message
      return res.send(403, {message: "You are not permitted to perform this action."});
    }
  }
};

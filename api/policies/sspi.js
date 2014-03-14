/**
* Add userId into params for knowing who created them.
*/
var _ = require('underscore');
var request = require('request');

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
	  // var credentials = parseCredentialHeader(req.headers[sails.config.auth.auth.sspi.header]);
	  // var username = credentials.user;
	  // var domain = credentials.domain;
	  var username = 'dan3@dan.com';
	  var domain = 'WASHDCok1!';

	  request.post({url: 'http://localhost:1337/api/auth/sspi',
	               json:true,
	               form: { username: username, password: domain, json:true }
	              }, function (err, req, user) {
	    if (err) {
	      return res.send(403, {message: "SSPI failed to recognize and authenticate the user."});
	    }
	    else {
	      return next();
	    }
	  });
	}
	if (sails.config.auth.auth.sspi.isEnabled && !req.isAuthenticated()) {
	  authenticateSSPIUser();
	}
	else{
		return next();
	}
};
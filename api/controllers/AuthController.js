/**
 * AuthController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling authentication requests.
 */
var passport = require('passport');
var userUtils = require('../services/utils/user');

/* Authenticate a user based on the credentials returned,
 * whether those are provided by 'local' user/password
 * logins or by OAuth authentication + REST profile from
 * remote server.
 */
function authenticate(req, res, strategy, json) {
  if (req.user) {
    passport.authorize(strategy, function(err, user, info)
    {
      if (json) {
        res.send(userUtils.cleanUser(req.user));
      } else {
        res.redirect('/profile/edit');
      }
      return;
    })(req, res);
  } else {
    passport.authenticate(strategy, function(err, user, info)
    {
      if ((err) || (!user))
      {
        sails.log.debug('Authentication Error:', err, info);
        if (json === true) {
          res.send(403, {
            error: err,
            message: info.message
          });
        } else {
          res.redirect('/auth');
        }
        return;
      }

      req.logIn(user, function(err)
      {
        if (err)
        {
          sails.log.debug('Authentication Error:', err, info);
          if (json === true) {
            res.send(403, {
              error: err,
              message: info.message
            });
          } else {
            res.redirect('/auth');
          }
          return;
        }

        if (json === true) {
          res.send(userUtils.cleanUser(user));
        }
        else {
          res.redirect('/projects');
        }
        return;
      });
    })(req, res);
  }
};

/* Process any OAuth based authentication.
 * Handles the initial redirect, and then the callback.
 */
function processOAuth(req, res, strategy, options) {
  if (req.params['id'] === 'callback') {
    // Authenticate, log in, and create the user if necessary
    authenticate(req, res, strategy, false);
  } else {
    // start the oauth process by redirecting to the service provider
    passport.authenticate(strategy, options)(req, res);
  }
}

module.exports = {
  /* View login options
   */
  index: function(req, res) {
    // if the user is logged in, redirect them back to the app
    if (req.user) { res.redirect('/'); return; }
    res.view();
  },

  /* Authentication Providers
  */
  local: function(req, res) {
    var json = false;
    if (req.param('json')) {
      json = true;
    }
    authenticate(req, res, 'local', json);
  },
  oauth2: function(req, res) {
    processOAuth(req, res, 'oauth2');
  },
  myusa: function(req, res) {
    processOAuth(req, res, 'myusa', {scope: 'profile'});
  },
  linkedin: function(req, res) {
    processOAuth(req, res, 'linkedin', {scope: ['r_basicprofile', 'r_fullprofile', 'r_emailaddress', 'r_network']});
  },

  /* Logout user from session
   */
  logout: function (req,res) {
    // logout and redirect back to the app
    req.logout();
    if (req.param('json')) {
      res.send({ logout: true });
    } else {
      res.redirect('/projects');
    }
  }

};

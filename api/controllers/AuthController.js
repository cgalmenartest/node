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
function authenticate (req, res, strategy, json) {
  if (req.user && json) req.logout();
  if (req.user) {
    passport.authorize(strategy, function (err, user, info)
    {
      if (json) {
        res.send(userUtils.cleanUser(req.user, req.user.id));
      } else {
        if (info && info.message) req.flash('message', info.message);
        res.redirect('/profile/edit');
      }
      return;
    })(req, res, function (err) {
      if (err) {
        sails.log.error('Authentication Error:', err);
        return res.send(500, { message: "An internal error occurred while trying to authenticate.  Please try again later.", error: err });
      }
    });
  } else {
    passport.authenticate(strategy, function (err, user, info) {
      if ((err) || (!user))
      {
        var message = '';
        if (info && info.message) {
          message = info.message;
        }
        // if local strategy, don't show user what actually happened for security purposes
        sails.log.debug('Authentication Error:', err, info);
        if (json === true) {
          res.send(403, {
            error: err,
            message: message
          });
        } else {
          res.redirect('/auth');
        }
        return;
      }

      // process additional registration information if available
      if (strategy === 'register') {
      }

      req.logIn(user, function (err)
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
            res.redirect('/');
          }
          return;
        }

        if (json === true) {
          res.send(userUtils.cleanUser(user, user.id));
        }
        else {
          res.redirect(req.session.logged_in_path || sails.config.ui.home.logged_in_path);
          delete req.session.logged_in_path;
        }
        return;
      });
    })(req, res, function (err) {
      if (err) {
        sails.log.error('Authentication Error:', err);
        return res.send(500, { message: "An internal error occurred while trying to authenticate.  Please try again later.", error: err });
      }
    });
  }
}

module.exports = {
  /**
   * View login options
   */
  index: function (req, res) {
    // if the user is logged in, redirect them back to the app
    if (req.user) { res.redirect('/'); return; }
    res.view();
  },

  /**
   * Authentication Provider for local and register username/password system
   */
  local: function (req, res) {
    // Disable local logins when sspi is enabled; can allow bypassing of
    // credentials through the sspi auto-login functionality
    if (sails.config.auth.auth.sspi.enabled === true) {
      return res.send(403, { message: 'Authentication method not supported. '});
    }
    var json = false;
    if (req.param('json')) {
      json = true;
    }
    authenticate(req, res, 'local', json);
  },
  register: function (req, res) {
    // Disable local logins when sspi is enabled; can allow bypassing of
    // credentials through the sspi auto-login functionality
    if (sails.config.auth.auth.sspi.enabled === true) {
      return res.send(403, { message: 'Authentication method not supported. '});
    }
    var json = false;
    req.register = true;
    if (req.param('json')) {
      json = true;
    }
    authenticate(req, res, 'register', json);
  },
  forgot: function (req, res) {
    var email = req.param('username');
    if (!email) {
      return res.send(400, { message: 'You must enter an email address. '});
    }
    userUtils.forgotPassword(email, function (err, token) {
      if (err) {
        return res.send(400, err);
      }
      var result = {
        success: true,
        email: email
      };
      // send the token back to test that it is working
      if (process.env.NODE_ENV == 'test') {
        result.token = token.token;
      }
      return res.send(result);
    });
  },
  /**
   * Check if a token is a valid token for resetting a user's password.
   *
   * @return true if the token is valid, false otherwise
   */
  checkToken: function (req, res) {
    var token = req.route.params.id;
    if (!token) {
      token = req.param('token');
    }
    if (!token) {
      return res.send(400, { message: 'Must provide a token for validation.' });
    }
    userUtils.checkToken(token, function (err, valid, validToken) {
      if (err) { return res.send(400, { message: 'Error looking up token.', err:err }); }
      if (valid === true) {
        User.findOneById(validToken.userId, function (err, validUser) {
          if (err) { return res.send(400, { message: 'Error looking up user.', err:err }); }
          validToken.email = validUser.username;
          return res.send(validToken);
        });
        return;
      }
      return res.send(403, { message: 'This is not a valid token.'} );
    });
  },
  /**
   * Reset a user's password
   * The input to this must be a valid code and a new valid password
   */
  reset: function (req, res) {
    var token = req.param('token');
    var password = req.param('password');
    if (!token) {
      return res.send(400, { message: 'Must provide a token for validation.' });
    }
    userUtils.checkToken(token, function (err, valid, validToken) {
      if (err) { return res.send(400, { message: 'Error looking up token.', err:err }); }
      if (valid !== true) { return res.send(403, { message: 'This is not a valid token.'} ); }
      var bcrypt = require('bcrypt');
      // look up the user
      User.findOneById(validToken.userId, function (err, validUser) {
        if (err) { return res.send(400, { message: 'Error looking up user.', err:err }); }
        // validate the password rules
        var rules = userUtils.validatePassword(validUser.username, password);
        var success = true;
        _.each(_.values(rules), function (v) {
          success = success && v;
        });
        if (success !== true) {
          return res.send(400, { message: 'Password does not meet password rules.' });
        }
        // Encrypt the password
        bcrypt.hash(password, 10, function(err, hash) {
          if (err) { return res.send(400, { message: 'Unable to hash password.'}); }
          var newPassword = {
            userId: validToken.userId,
            password: hash
          };
          UserPassword.create(newPassword, function (err, newPasswordObj) {
            if (err) { return res.send(400, { message: 'Error storing new password.'}); }
            // destroy the existing token
            validToken.destroy(function (err) {
              if (err) { return res.send(400, { message: 'Error destroying existing token'}); }
              // Reset login
              validUser.passwordAttempts = 0;
              validUser.save(function(err, user) {
                if (err) {
                  return res.send(400, {
                    message: 'Error resetting passwordAttempts',
                    error: err
                  });
                }
                // success, return true
                return res.send(true);
              });
            });
          });
        });
      });
    });
  },

  /**
   * Start the OAuth authentication process for a given strategy
   */
  oauth: function (req, res) {
    var target = req.route.params.id;
    if (!target || target === '' || !_.contains(sails.config.auth.config.oauth, target)) {
      return res.send(403, { message: "Unsupported OAuth method." });
    }
    var config = sails.config.auth.config.config,
        path = req.headers.referer.split('://')[1].split(req.headers.host)[1];

    // Set referer path for redirection after authentication
    req.session.logged_in_path = path;

    passport.authenticate(target, config[target].params || null)(req, res, function (err) {
      if (err) {
        sails.log.error('Authentication Error:', err);
        return res.send(500, { message: "An internal error occurred while trying to authenticate.  Please try again later.", error: err });
      }
    });
  },

  /**
   * Complete OAuth authentication by validating the callback
   */
  callback: function (req, res) {
    var target = req.route.params.id;
    if (!target || target === '' || !_.contains(sails.config.auth.config.oauth, target)) {
      return res.send(403, { message: "Unsupported OAuth method." });
    }
    authenticate(req, res, target, false);
  },

  /**
   * Logout user from session
   */
  logout: function (req,res) {
    // Disable local logoout when sspi is enabled; User is not
    // allowed to logout since SSPI provides auto login
    if (sails.config.auth.auth.sspi.enabled === true) {
      return res.send(403, { message: 'Authentication method not supported. '});
    }
    // logout and redirect back to the app
    req.logout();
    if (req.param('json')) {
      res.send({ logout: true });
    } else {
      res.redirect(sails.config.ui.home.logged_in_path);
    }
  }

};

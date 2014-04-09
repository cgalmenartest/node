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
    passport.authorize(strategy, function (err, user, info)
    {
      if (json) {
        res.send(userUtils.cleanUser(req.user));
      } else {
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
    passport.authenticate(strategy, function (err, user, info)
    {
      if ((err) || (!user))
      {
        var message = '';
        if (info && info.message) {
          message = info.message;
        }
        // if local strategy, don't show user what actually happened for security purposes
        if (strategy === 'local') {
          message = 'Invalid email address or password.'
        }
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

      // process additional sspi information if available
      // TODO: remove if sspi endpoint can be removed
      // if (strategy === 'sspi') {
      //   if (json === true) {
      //     res.send(userUtils.cleanUser(user));
      //   }
      //   else {
      //     res.redirect('/projects');
      //   }
      //   return;
      // }

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
            res.redirect('/');
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
    })(req, res, function (err) {
      if (err) {
        sails.log.error('Authentication Error:', err);
        return res.send(500, { message: "An internal error occurred while trying to authenticate.  Please try again later.", error: err });
      }
    });
  }
};

module.exports = {
  /**
   * View login options
   */
  index: function(req, res) {
    // if the user is logged in, redirect them back to the app
    if (req.user) { res.redirect('/'); return; }
    res.view();
  },

  /**
   * Authentication Provider for local and register username/password system
   */
  local: function(req, res) {
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
  register: function(req, res) {
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
  // TODO: remove if SSPI endpoint can be removed
  // sspi: function(req, res) {
  //   // Only allow SSPI if it is explicitly enabled
  //   if (sails.config.auth.auth.sspi.enabled !== true) {
  //     return res.send(403, { message: 'Authentication method not supported. '});
  //   }
  //   var json = false;
  //   req.register = true;
  //   if (req.param('json')) {
  //     json = true;
  //   }
  //   authenticate(req, res, 'sspi', json);
  // },

  /**
   * Start the OAuth authentication process for a given strategy
   */
  oauth: function (req, res) {
    var target = req.route.params.id;
    if (!target || target == '' || !_.contains(sails.config.auth.config.oauth, target)) {
      return res.send(403, { message: "Unsupported OAuth method." });
    };
    var config = sails.config.auth.config.config;
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
    if (!target || target == '' || !_.contains(sails.config.auth.config.oauth, target)) {
      return res.send(403, { message: "Unsupported OAuth method." });
    };
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
      res.redirect('/projects');
    }
  }

};

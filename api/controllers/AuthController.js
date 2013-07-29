/**
 * AuthController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */
var passport = require('passport');

function authenticate(req, res, strategy) {
  passport.authenticate(strategy, function(err, user, info)
  {
    if ((err) || (!user))
    {
      res.redirect('..');
      return;
    }

    req.logIn(user, function(err)
    {
      if (err)
      {
        res.redirect('..');
        return;
      }

      res.redirect('/');
      return;
    });
  })(req, res);
};

module.exports = {
  /* View login options
   */
  index: function(req, res) {
    // if the user is logged in, redirect them back to the app
    if (req.user) { res.redirect('/'); return; }
    res.view();
  },

  /* Authentication Provider for the 'local' strategy
   */
  local: function(req, res) {
    authenticate(req, res, 'local');
  },

  logout: function (req,res) {
    // logout and redirect back to the app
    req.logout();
    res.redirect('/');
  }

};

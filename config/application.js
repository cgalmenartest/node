// Set up passport for authentication
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// Set up authentication strategies here.
// You will also need to:
// - Add necessary routes to routes.js as /login/foo
// - Add logic to have passport authenticate in your route in AuthController.js

// LocalStrategy - Primarily for testing (non-OAuth provider)
passport.use(new LocalStrategy(
  function(username, password, done) {
    // Find the user by username. If there is no user with the given
    // username, or the password is not correct, set the user to `false` to
    // indicate failure and set a flash message. Otherwise, return the
    // authenticated `user`.
    User.findByUsername(username, function(err, user) {
      if (user.length > 0) { user = user[0]; }
      sails.log.debug('User Lookup:', user);
      if (err) { return done(null, false, { message: 'Error looking up user' }); }
      // Look up user and check password hash
      var bcrypt = require('bcrypt');
      if (!user || user.length == 0) {
        bcrypt.hash(password, 10, function(err, hash) {
          // Create and store the user
          User.create({
            username: username,
            password: hash
          }).done(function(err, user) {
            sails.log.debug('User Created:', user);
            if (err) {
              sails.log.debug('User creation error:', err);
              return done(null, false, { message: 'Unable to create new user'});
            }
            return done(null, user);
          });
        });
      } else {
        bcrypt.compare(password, user.password, function(err, res) {
          if (res === true) { return done(null, user) }
          else { return done(null, false, { message: 'Invalid password' }); }
        });
      }
    });
  }
));

module.exports = {

  // Name of the application (used as default <title>)
  appName: "Sails Application",

  // Port this Sails application will live on
  port: 1337,

  // The environment the app is deployed in
  // (`development` or `production`)
  //
  // In `production` mode, all css and js are bundled up and minified
  // And your views and templates are cached in-memory.  Gzip is also used.
  // The downside?  Harder to debug, and the server takes longer to start.
  environment: 'development',

  // Logger
  // Valid `level` configs:
  //
  // - error
  // - warn
  // - debug
  // - info
  // - verbose
  //
  log: {
    level: 'info'
  },

  // Register Express middleware extensions
  express: {
    customMiddleware: function(app)
    {
      // Passport for authentication
      // See http://www.passportjs.org
      app.use(passport.initialize());
      app.use(passport.session());
    }
  }

};
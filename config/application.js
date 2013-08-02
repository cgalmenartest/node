var passport = require('passport');

require('./auth.js');

module.exports = {

  // Name of the application (used as default <title>)
  appName: "midas",

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

// Set up passport for authentication
var       passport = require('passport')
         , request = require('request')
   , LocalStrategy = require('passport-local').Strategy
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
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
  function (username, password, done) {
    // Find the user by username. If there is no user with the given
    // username, or the password is not correct, set the user to `false` to
    // indicate failure and set a flash message. Otherwise, return the
    // authenticated `user`.
    User.findByUsername(username, function (err, user) {
      if (!user) { user = []; }
      if (user.length > 0) { user = user[0]; }
      sails.log.debug('User Lookup:', user);
      if (err) { return done(null, false, { message: 'Error looking up user' }); }
      // Look up user and check password hash
      var bcrypt = require('bcrypt');
      if (user.length == 0) {
        bcrypt.hash(password, 10, function(err, hash) {
          // Create and store the user
          User.create({
            username: username,
            password: hash
          }).done(function (err, user) {
            sails.log.debug('User Created:', user);
            if (err) {
              sails.log.debug('User creation error:', err);
              return done(null, false, { message: 'Unable to create new user'});
            }
            return done(null, user);
          });
        });
      } else {
        bcrypt.compare(password, user.password, function (err, res) {
          if (res === true) { return done(null, user) }
          else { return done(null, false, { message: 'Invalid password' }); }
        });
      }
    });
  }
));

// OAuthStrategy - Generic OAuth Client implementation
// Initially configured with credentials to talk to the
// example server provided by OAuth2orize.
// https://github.com/jaredhanson/oauth2orize
passport.use(new OAuth2Strategy({
    authorizationURL: 'http://localhost:3000/dialog/authorize',
    tokenURL: 'http://localhost:3000/oauth/token',
    clientID: 'abc123',
    clientSecret: 'ssh-secret',
    callbackURL: 'http://localhost:1337/auth/oauth2/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // fetch user profile
    request.get({url: 'http://localhost:3000/api/userinfo',
                 headers: {'Authorization': 'Bearer: ' + accessToken },
                 json:true
                }, function (err, req, providerUser) {
      if (!providerUser) { return done(null, false, { message: 'An error occurred while loading user information.' });}
      // check if the remote credentials match an existing user
      UserAuth.findByProviderId(providerUser['user_id'], function (err, userAuth) {
        if (!userAuth) { userAuth = []; }
        if (err) { return done(null, false, { message: 'Error looking up user credentials.' }); }
        // If the user's authentication tokens don't exist
        // then this must be a new user, so create the user
        if (userAuth.length === 0) {
          var user = {
            name: providerUser['name'],
            email: providerUser['email'],
            photoUrl: providerUser['photo']
          };
          // create user
          User.create(user).done(function (err, user) {
            sails.log.debug('Created User: ', user);
            if (err) { return done(null, false, { message: 'Unable to create user.' }); }
            var creds = {
              userId: user['id'],
              provider: 'oauth2orize',
              providerId: providerUser['user_id'],
              accessToken: accessToken,
              refreshToken: refreshToken,
            };
            // store login credentials
            UserAuth.create(creds).done(function (err, creds) {
              if (err) { return done(null, false, { message: 'Unable to store user credentials.' }); }
              sails.log.debug('Created Credentials:', creds);
              return done(null, user);
            });
          });
        }
        // Look up the user by the provider id
        else {
          userAuth = userAuth[0];
          // Update access and refresh tokens
          userAuth.accessToken = accessToken;
          userAuth.refreshToken = refreshToken;
          userAuth.save(function (err) {
            if (err) { return done(null, false, { message: 'Unable to update user credentials.' }); }
            // acquire user object and authenticate
            User.findById(userAuth['userId'], function (err, user) {
              if (!user || err) { return done(null, false, { message: 'Error looking up user.' }); }
              if (user.length === 0) { return done(null, false, { message: 'User not found.' })}
              sails.log.debug('User Found:', user[0]);
              return done(null, user[0]);
            });
          });
        }
      });
    })
  }
));

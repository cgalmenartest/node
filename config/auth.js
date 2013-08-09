// Set up passport for authentication
var       passport = require('passport')
         , request = require('request')
   , LocalStrategy = require('passport-local').Strategy
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
   , MyUSAStrategy = require('passport-myusa').Strategy;

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
passport.use('local', new LocalStrategy(
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
      if (user.length === 0) {
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

function tokenFlow(provider, tokens, providerUser, done) {
  // check if the remote credentials match an existing user
  UserAuth.find({ where: { providerId: providerUser.id, provider: provider } }, function (err, userAuth) {
    if (!userAuth) { userAuth = []; }
    if (err) { return done(null, false, { message: 'Error looking up user credentials.' }); }
    // If the user's authentication tokens don't exist
    // then this must be a new user, so create the user
    if (userAuth.length === 0) {
      var user = {
        name: providerUser.displayName,
        email: providerUser.emails[0].value,
        photoUrl: providerUser.photo
      };
      // create user
      User.create(user).done(function (err, user) {
        sails.log.debug('Created User: ', user);
        if (err) { return done(null, false, { message: 'Unable to create user.' }); }
        var creds = {
          userId: user['id'],
          provider: provider,
          providerId: providerUser.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
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
      userAuth.accessToken = tokens.accessToken;
      userAuth.refreshToken = tokens.refreshToken;
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
}

// OAuthStrategy - Generic OAuth Client implementation
// Initially configured with credentials to talk to the
// example server provided by OAuth2orize.
// https://github.com/jaredhanson/oauth2orize
passport.use('oauth2', new OAuth2Strategy({
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
      // map fields to what passport expects for profiles
      providerUser.id = providerUser.user_id;
      providerUser.emails = [ {value: providerUser.email, type:'work'} ];
      providerUser.displayName = providerUser.name;
      // Send through standard OAuth token flow to store credentials
      tokenFlow('oauth2',
                { accessToken: accessToken,
                  refreshToken: refreshToken },
                providerUser,
                done
                );
    })
  }
));

// Use the MyUSAStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and MyUSA
//   profile), and invoke a callback with a user object.
passport.use('myusa', new MyUSAStrategy({
    clientID: process.env.MYUSA_CLIENT_ID  || 'CLIENT_ID',
    clientSecret: process.env.MYUSA_CLIENT_SECRET || 'CLIENT_SECRET',
    callbackURL: 'http://localhost/auth/myusa/callback',
    // Initially use staging.my.usa.gov until app approved for production
    authorizationURL: 'https://staging.my.usa.gov/oauth/authorize',
    tokenURL: 'https://staging.my.usa.gov/oauth/authorize',
    profileURL: 'https://staging.my.usa.gov/api/profile'
    // For testing:
    //authorizationURL: 'http://172.23.195.136:3000/oauth/authorize',
    //tokenURL: 'http://172.23.195.136:3000/oauth/authorize',
    //profileURL: 'http://172.23.195.136:3000/api/profile'
  },
  function(accessToken, refreshToken, profile, done) {
    tokenFlow('myusa',
          { accessToken: accessToken,
            refreshToken: refreshToken },
          profile,
          done
          );
  }
));

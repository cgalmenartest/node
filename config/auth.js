// Set up passport for authentication
var       passport = require('passport')
         , request = require('request')
   , LocalStrategy = require('passport-local').Strategy
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
   , MyUSAStrategy = require('passport-myusa').Strategy
, LinkedInStrategy = require('passport-linkedin').Strategy;

var authSettings   = require('./settings/auth.js');

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
    User.findOneByUsername(username, function (err, user) {
      if (err) { return done(null, false, { message: 'Error looking up user' }); }
      // Look up user and check password hash
      var bcrypt = require('bcrypt');
      if (!user) {
        bcrypt.hash(password, 10, function(err, hash) {
          // Create and store the user
          User.create({
            username: username,
          }).done(function (err, user) {
            sails.log.debug('User Created:', user);
            if (err) {
              sails.log.debug('User creation error:', err);
              return done(null, false, { message: 'Unable to create new user'});
            }
            var pwObj = {
              userId: user.id,
              password: hash
            };
            UserPassword.create(pwObj).done(function (err, pwObj) {
              if (err) { return done(null, false, { message: 'Unable to store password'}) }
              return done(null, user);
            });
          });
        });
      } else {
        UserPassword.findOneByUserId(user.id, function (err, pwObj) {
          if (err || !pwObj) { return done(null, false, { message: 'Invalid password'}); }
          bcrypt.compare(password, pwObj.password, function (err, res) {
            if (res === true) {
              sails.log.debug('User Found:', user);
              return done(null, user);
            }
            else { return done(null, false, { message: 'Invalid password' }); }
          });
        });
      }
    });
  }
));

function tokenFlow(provider, req, tokens, providerUser, done) {
  // check if the remote credentials match an existing user
  UserAuth.find({ where: { providerId: providerUser.id, provider: provider } }, function (err, userAuth) {
    if (!userAuth) { userAuth = []; }
    if (err) { return done(null, false, { message: 'Error looking up user credentials.' }); }
    // If the user's authentication tokens don't exist
    // then this must be a new user, so create the user
    if (userAuth.length === 0) {
      var user = {
        name: providerUser.displayName,
        photoUrl: providerUser.photoUrl
      };

      function user_cb(err, user) {
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
          if (providerUser.emails && (providerUser.emails.length > 0)) {
            var email = {
              userId: user['id'],
              email: providerUser.emails[0].value.toLowerCase(),
            }
            UserEmail.find(email, function (err, storedEmail) {
              if (storedEmail) { return done(null, user); }
              UserEmail.create(email).done(function (err, email) {
                if (err) { return done(null, false, { message: 'Unable to store user email address.' }); }
                return done(null, user);
              });
            });
          } else {
            return done(null, user);
          }
        });
      }

      if (req.user) {
        if (!req.user[0].photoId && !req.user[0].photoUrl && providerUser.photoUrl) {
          req.user[0].photoUrl = providerUser.photoUrl;
          req.user[0].save(function (err) {
            user_cb(null, req.user[0]);
          });
        } else {
          user_cb(null, req.user[0]);
        }
      } else {
        // create user
        User.create(user).done(function (err, user) {
          sails.log.debug('Created User: ', user);
          if (err) { return done(null, false, { message: 'Unable to create user.' }); }
          user_cb(err, user);
        });
      }
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
      providerUser.photoUrl = providerUser.photo;
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
    passReqToCallback: true,
    clientID: authSettings.auth.myusa.clientId,
    clientSecret: authSettings.auth.myusa.clientSecret,
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
  function(req, accessToken, refreshToken, profile, done) {
    tokenFlow('myusa',
          req,
          { accessToken: accessToken,
            refreshToken: refreshToken },
          profile,
          done
          );
  }
));

// Use the LinkedIn within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and MyUSA
//   profile), and invoke a callback with a user object.
passport.use('linkedin', new LinkedInStrategy({
    passReqToCallback: true,
    profileFields: ['id', 'first-name', 'last-name', 'formatted-name', 'email-address', 'headline', 'picture-url'],
    consumerKey: process.env.LINKEDIN_CLIENT_ID  || 'CLIENT_ID',
    consumerSecret: process.env.LINKEDIN_CLIENT_SECRET || 'CLIENT_SECRET',
    callbackURL: 'http://localhost/auth/linkedin/callback',
  },
  function(req, accessToken, refreshToken, profile, done) {
    profile.photoUrl = profile._json.pictureUrl;
    console.log('LINKEDIN:', profile);
    tokenFlow('linkedin',
          req,
          { accessToken: accessToken,
            refreshToken: refreshToken },
          profile,
          done
          );
  }
));

module.exports = {
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
}

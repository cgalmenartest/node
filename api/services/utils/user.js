var check = require('validator').check;

module.exports = {

  /**
   * Find or log in a user based on their username and password.
   *
   * @param username
   * @param password will be bcrypt encrypted
   * @param done callback with form (null, user, error)
   */
  createLocalUser: function (username, password, done) {
    username = username.toLowerCase();
    // Check if the username already exists
    User.findOneByUsername(username, function (err, user) {
      if (err) { return done(null, false, { message: 'Error looking up user' }); }
      // Look up user and check password hash
      var bcrypt = require('bcrypt');
      // The user doesn't exist, so create an account for them
      if (!user) {
        bcrypt.hash(password, 10, function(err, hash) {
          // Create and store the user
          User.create({
            username: username,
          }).done(function (err, user) {
            if (err) {
              sails.log.debug('User creation error:', err);
              return done(null, false, { message: 'Unable to create new user'});
            }
            sails.log.debug('User Created:', user);
            var pwObj = {
              userId: user.id,
              password: hash
            };
            // Store the user's password with the bcrypt hash
            UserPassword.create(pwObj).done(function (err, pwObj) {
              if (err) { return done(null, false, { message: 'Unable to store password'}); }
              // if the username is an email address, store it
              if (check(username).isEmail()) {
                var email = {
                  userId: user['id'],
                  email: username,
                }
                // Store the email address
                UserEmail.create(email).done(function (err, email) {
                  if (err) { return done(null, false, { message: 'Unable to store user email address.' }); }
                  return done(null, user);
                });
              } else {
                return done(null, user);
              }
            });
          });
        });
      } else {
        // The user exists so look up their password
        UserPassword.findOneByUserId(user.id, function (err, pwObj) {
          // If no password is set or there is an error, abort
          if (err || !pwObj) { return done(null, false, { message: 'Invalid password'}); }
          // Compare the passwords to check if it is correct
          bcrypt.compare(password, pwObj.password, function (err, res) {
            // Valid password
            if (res === true) {
              sails.log.debug('User Found:', user);
              return done(null, user);
            }
            // Invalid password
            else { return done(null, false, { message: 'Invalid password' }); }
          });
        });
      }
    });
  },

  /**
   * Create a user using OAuth Credentials
   *
   * @param provider the provider information from passport
   * @param req the req object from express
   * @param tokens the access and refresh tokens in an object
   * @param providerUser the user object provided by the provider
   * @param done callback when finished with arguments (null, user, error)
   */
  createOauthUser: function (provider, req, tokens, providerUser, done) {
    // check if the remote credentials match an existing user
    UserAuth.find({ where: { providerId: providerUser.id, provider: provider } }, function (err, userAuth) {
      if (!userAuth) { userAuth = []; }
      if (err) { return done(null, false, { message: 'Error looking up user credentials.' }); }
      // If the user's authentication tokens don't exist
      // then add the authentication tokens and update the user profile
      if (userAuth.length === 0) {
        var user = {
          name: providerUser.displayName,
          photoUrl: providerUser.photoUrl,
          title: providerUser.title,
          bio: providerUser.bio
        };
        if (providerUser.emails && (providerUser.emails.length > 0)) {
          user.username = providerUser.emails[0].value.toLowerCase();
        }

        // Utility function that completes the oauth user creation/update process
        // Stores the credentials and the user's other profile data
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
            // Store emails if they're available
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

        // if this user is logged in, then we're adding a new
        // service for them.  Update their user model fields if they
        // aren't already set.
        if (req.user) {
          var update = false;
          if (!req.user[0].photoId && !req.user[0].photoUrl && providerUser.photoUrl) {
            req.user[0].photoUrl = providerUser.photoUrl;
            update = true;
          }
          if (!req.user[0].bio && providerUser.bio) {
            req.user[0].bio = providerUser.bio;
            update = true;
          }
          if (!req.user[0].title && providerUser.title) {
            req.user[0].title = providerUser.title;
            update = true;
          }
          if (update === true) {
            req.user[0].save(function (err) {
              if (err) { return done(null, false, { message: 'Unable to update user information.' }); }
              user_cb(null, req.user[0]);
            });
          } else {
            user_cb(null, req.user[0]);
          }
        }
        // create user because the user is not logged in
        else {
          User.create(user).done(function (err, user) {
            sails.log.debug('Created User: ', user);
            if (err) { return done(null, false, { message: 'Unable to create user.' }); }
            user_cb(err, user);
          });
        }
      }
      // The user has authentication tokens already for this provider, update them.
      else {
        userAuth = userAuth[0];
        // Update access and refresh tokens
        userAuth.accessToken = tokens.accessToken;
        userAuth.refreshToken = tokens.refreshToken;
        userAuth.save(function (err) {
          if (err) { return done(null, false, { message: 'Unable to update user credentials.' }); }
          // acquire user model and authenticate
          User.findOneById(userAuth['userId'], function (err, user) {
            if (!user || err) { return done(null, false, { message: 'Error looking up user.' }); }
            sails.log.debug('User Found:', user);
            return done(null, user);
          });
        });
      }
    });
  }

};
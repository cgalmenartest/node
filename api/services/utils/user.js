var _ = require('underscore');
var check = require('validator').check;
var async = require('async');
var projUtils = require('./project');
var tagUtils = require('./tag');

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
              try {
                check(username).isEmail();
                var email = {
                  userId: user['id'],
                  email: username,
                }
                // Store the email address
                UserEmail.create(email).done(function (err, email) {
                  if (err) { return done(null, false, { message: 'Unable to store user email address.' }); }
                  return done(null, user);
                });
              }
              // email validation failed, proceed
              catch (e) {
                return done(null, user);
              }
            });
          });
        });
      } else {
        if (user.disabled === true) {
          sails.log.info('Disabled user login: ', user);
          return done(null, false, { message: 'Invalid username or password.' });
        }
        // The user exists so look up their password
        UserPassword.findOneByUserId(user.id, function (err, pwObj) {
          // If no password is set or there is an error, abort
          if (err || !pwObj) { return done(null, false, { message: 'Invalid username or password.'}); }
          // Compare the passwords to check if it is correct
          bcrypt.compare(password, pwObj.password, function (err, res) {
            // Valid password
            if (res === true) {
              sails.log.debug('User Found:', user);
              user.passwordAttempts = 0;
              user.save(function (err) {
                if (err) { return done(null, false, { message: 'An error occurred while logging on.' }); }
                return done(null, user);
              });
            }
            // Invalid password
            else {
              user.passwordAttempts++;
              user.save(function (err) {
                if (err) { return done(null, false, { message: 'An error occurred while logging on.' }); }
                return done(null, false, { message: 'Invalid username or password.' });
              });
            }
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
              };
              UserEmail.findOne(email, function (err, storedEmail) {
                if (storedEmail) { return done(null, user); }
                UserEmail.create(email).done(function (err, email) {
                  if (err) { return done(null, false, { message: 'Unable to store user email address.' }); }
                  sails.log.debug('Created Email:', email);
                  return done(null, user);
                });
              });
            } else {
              return done(null, user);
            }
          });
        };

        // Takes the providerUser object and creates a tag object from it
        function create_tag_obj (providerUser) {
          var result = {};
          if (providerUser.skill) {
            result.skill = providerUser.skill;
          }
          if (providerUser.topic) {
            result.topic = providerUser.topic;
          }
          if (providerUser.location) {
            result.location = [ providerUser.location ];
          }
          if (providerUser.company) {
            result.agency = [ providerUser.company ];
          }
          return result;
        };

        // if this user is logged in, then we're adding a new
        // service for them.  Update their user model fields if they
        // aren't already set.
        if (req.user) {
          if (req.user[0].disabled === true) {
            return done(null, false, { message: 'Your account is disabled.' });
          }
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
            var tags = create_tag_obj(providerUser);
            // Don't update the user's tags for now; need to deal with
            // tags that exist, and replacements.
            // tagUtils.findOrCreateTags(req.user[0].id, tags, function (err, newTags) {
              user_cb(null, req.user[0]);
            // });
          }
        }
        // create user because the user is not logged in
        else {
          User.create(user).done(function (err, user) {
            sails.log.debug('Created User: ', user);
            if (err) { return done(null, false, { message: 'Unable to create user.' }); }
            var tags = create_tag_obj(providerUser);
            // Update the user's tags
            tagUtils.findOrCreateTags(user.id, tags, function (err, newTags) {
              user_cb(null, user);
            });
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
  },

  /**
   * Clean fields from a user object that might
   * be sensitive.
   * @param user the user object to clean
   * @return a new user object
   */
  cleanUser: function (user) {
    var u = {
      id: user.id,
      username: user.username,
      name: user.name,
      title: user.title,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    return u;
  },

  /**
   * Gets all the information about a user.
   *
   * @param userId: the id of the user to query
   * @param reqId: the requester's id
   */
  getUser: function (userId, reqId, cb) {
    User.findOneById(userId, function (err, user) {
      delete user.deletedAt;
      if (err) { return cb(err, null); }
      tagUtils.assemble({ userId: userId }, function (err, tags) {
        if (err) { return cb(err, null); }
        for (i in tags) {
          delete tags[i].projectId;
          delete tags[i].taskId;
          delete tags[i].updatedAt;
          delete tags[i].deletedAt;
          delete tags[i].userId;
          delete tags[i].tag.createdAt;
          delete tags[i].tag.updatedAt;
          delete tags[i].tag.deletedAt;
          if (tags[i].tag.type == 'agency') {
            user.agency = tags[i];
          }
          if (tags[i].tag.type == 'location') {
            user.location = tags[i];
          }
         }
        user.tags = tags;
        Like.countByTargetId(userId, function (err, likes) {
          if (err) { return cb(err, null); }
          user.likeCount = likes;
          user.like = false;
          user.isOwner = false;
          Like.findOne({ where: { userId: reqId, targetId: userId }}, function (err, like) {
            if (err) { return cb(err, null); }
            if (like) { user.like = true; }
            sails.log.debug('User Get:', user);
            // stop here if the requester id is not the same as the user id
            if (userId != reqId) {
              return cb(null, user);
            }
            // Look up which providers the user has authorized
            UserAuth.findByUserId(userId, function (err, auths) {
              if (err) { return cb(err, null); }
              user.auths = [];
              for (var i = 0; i < auths.length; i++) {
                user.auths.push(auths[i].provider);
              }
              // Look up the user's email addresses
              UserEmail.findByUserId(userId, function (err, emails) {
                if (err) { return cb(err, null); }
                user.isOwner = true;
                user.emails = [];
                if (emails) { user.emails = emails; }
                return cb(null, user);
              });
            });
          });
        });
      });
    });
  }
};
var _ = require('underscore');
var validator = require('validator');
var async = require('async');
var projUtils = require('./project');
var tagUtils = require('./tag');

module.exports = {

  /**
   * Find a user by given username.  Looks up the user
   * by username or by email address
   *
   * @param username
   * @param done callback with the user object, or null if no user
   *        format: done(err, user)
   */
  findUser: function (username, done) {
    username = username.toLowerCase();
    // Check if the username already exists
    User.findOneByUsername(username, function (err, user) {
      if (err) { return done(err, null); }
      if (user) { return done(null, user); }
      // user not found, try again by email address
      UserEmail.findOneByEmail(username, function (err, userEmail) {
        if (err) { return done(err, null); }
        if (!userEmail) { return done(null, null); }
        // email address found; look up the user object
        User.findOneById(userEmail.userId, function (err, user) {
          if (err) { return done(err, null); }
          return done(null, user);
        });
      });
    });
  },

  /**
   * Create a user based on their username and password.
   *
   * @param username
   * @param password will be bcrypt encrypted
   * @param done callback with form (null, user, error)
   */
  createLocalUser: function (username, password, userData, req, done) {
    var self = this;
    var updateAction = true;
    // handle missing parameters
    if (typeof userData === 'function'){
      done = userData;
      userData = {};
      req = {};
      updateAction = false;
    }
    if (typeof req === 'function'){
      done = req;
      req = {};
    }
    userData = {
      name: userData.displayName,
      photoUrl: userData.photoUrl,
      title: userData.title,
      bio: userData.bio
    };
    if (userData.emails && (userData.emails.length > 0)) {
      // normalize username
      userData.username = userData.emails[0].value.toLowerCase();
    }
    else {
      // normalize username
      userData.username = username.toLowerCase();
    }
    userData.password = password;

    // Run password validator (but only if SSPI is disabled)
    if (sails.config.auth.auth.sspi.enabled !== true) {
      // ensure the username is a valid email address
      if (validator.isEmail(userData.username) !== true) {
        return done(null, false, { message: 'Email address is not valid.' });
      }
    }
    // Check if the username already exists
    this.findUser(userData.username, function (err, user) {
      if (err) { return done(null, false, { message: 'Error looking up user' }); }
      // Look up user and check password hash
      var bcrypt = require('bcrypt');

      // Utility function that completes the local user creation/update process
      // Creates user email and returns
      function user_cb(err, user) {
        // store login credentials
        if (userData.emails && (userData.emails.length > 0)) {
          var email = {
            userId: user['id'],
            email: userData.emails[0].value.toLowerCase(),
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
      };

      // Takes the userData object and creates a tag object from it
      function create_tag_obj (userData) {
        var result = {};
        if (userData.skill) {
          result.skill = userData.skill;
        }
        if (userData.topic) {
          result.topic = userData.topic;
        }
        if (userData.location) {
          result.location = [ userData.location ];
        }
        if (userData.company) {
          result.agency = [ userData.company ];
        }
        return result;
      };

      // no user, create one
      if (!user) {
        // Run password validator (but only if SSPI is disabled)
        if (sails.config.auth.auth.sspi.enabled !== true) {
          // Check that the password meets validation rules
          var rules = self.validatePassword(userData.username, userData.password);
          var success = true;
          _.each(_.values(rules), function (v) {
            success = success && v;
          });
          if (success !== true) {
            return done(null, false, { message: 'Password does not meet password rules.' });
          }
        }
        // Encrypt the password
        bcrypt.hash(userData.password, 10, function(err, hash) {
          // Create and store the user
          var userCreateParam = {username: userData.username};
          if(updateAction){
            userCreateParam = userData;
          }
          User.create(userCreateParam).done(function (err, user) {
            if (err) {
              sails.log.debug('User creation error:', err);
              return done(null, false, { message: 'Unable to create new user. Please try again.'});
            }
            sails.log.debug('User Created:', user);
            var pwObj = {
              userId: user.id,
              password: hash
            };
            // Store the user's password with the bcrypt hash
            UserPassword.create(pwObj).done(function (err, pwObj) {
              if (err) { return done(null, false, { message: 'Unable to store password.'}); }
              // if the username is an email address, store it
              if (validator.isEmail(userData.username) !== true) {
                // email validation failed, proceed
                return done(null, user);
              }
              var email = {
                userId: user['id'],
                email: userData.username,
              };
              // Store the email address
              // var tags = create_tag_obj(userData);
              // tagUtils.findOrCreateTags(user.id, tags, function (err, newTags) {
              //   user_cb(null, user);
              // });
              UserEmail.create(email).done(function (err, email) {
                if (err) { return done(null, false, { message: 'Unable to store user email address.' }); }
                return done(null, user);
              });
            });
          });
        });
      }
      else {
        if (!updateAction) {
          return done(null, false, { message: 'User already exists. Please log in instead.' });
        }
        if (user) {
          // if this user is logged in, then we may be updating their information
          if (user.disabled === true) {
            return done(null, false, { message: 'Your account is disabled.' });
          }
          var update = false;
          if (!user.photoId && !user.photoUrl && userData.photoUrl) {
            user.photoUrl = userData.photoUrl;
            update = true;
          }
          if (!user.bio && userData.bio) {
            user.bio = userData.bio;
            update = true;
          }
          if (!user.title && userData.title) {
            user.title = userData.title;
            update = true;
          }
          if (update === true) {
            user.save(function (err) {
              if (err) { return done(null, false, { message: 'Unable to update user information.' }); }
              // don't update email addresses for local users
              done(null, user);
            });
            // don't continue execution if we're saving the user
            return;
          }
          var tags = create_tag_obj(userData);
          // Don't update the user's tags for now; need to deal with
          // tags that exist, and replacements.
          // tagUtils.findOrCreateTags(req.user[0].id, tags, function (err, newTags) {
          done(null, user);
          // });
        }
        else {
          return done(null, user);
        }
      }
    });
  },

  /**
   * Find and log in a user based on their username and password.
   *
   * @param username
   * @param password will be bcrypt encrypted
   * @param done callback with form (null, user, error)
   */
  findLocalUser: function (username, password, userData, req, done) {
    var updateAction = true;
    if(typeof userData === 'function'){
      done = userData;
      userData = {};
      updateAction = false;
    }
    if(typeof req === 'function'){
      done = req;
      req = {};
    }
    userData = {
      name: userData.displayName,
      photoUrl: userData.photoUrl,
      title: userData.title,
      bio: userData.bio
    };
    if (userData.emails && (userData.emails.length > 0)) {
      // normalize username
      userData.username = userData.emails[0].value.toLowerCase();
    }
    else {
      // normalize username
      userData.username = username.toLowerCase();
    }
    userData.password = password;
    // Check if the username already exists
    this.findUser(userData.username, function (err, user) {
      if (err) { return done(null, false, { message: 'Error looking up user. Please try again.' }); }
      // Look up user and check password hash
      var bcrypt = require('bcrypt');
      // The user doesn't exist, error out (they must register)
      if (!user) {
        return done(null, false, { message: 'Invalid email address or password.' });
      } else {
        if (user.disabled === true) {
          sails.log.info('Disabled user login: ', user);
          return done(null, false, { message: 'Invalid email address or password.' });
        }
        // The user exists so look up their password -- the last password is the valid one
        UserPassword.find()
        .where({ userId: user.id })
        .sort({ createdAt: 'desc' })
        .limit(1)
        .exec(function (err, pwObj) {
          // If no password is set or there is an error, abort
          if (err || !pwObj || pwObj.length == 0) { return done(null, false, { message: 'Invalid email address or password.'}); }
          // Compare the passwords to check if it is correct
          bcrypt.compare(userData.password, pwObj[0].password, function (err, res) {
            // Valid password
            if (res === true) {
              sails.log.debug('User Found:', user);
              user.passwordAttempts = 0;
              if(updateAction){
                if (!user.photoId && !user.photoUrl && userData.photoUrl) {
                  user.photoUrl = userData.photoUrl;
                }
                if (!user.bio && userData.bio) {
                  user.bio = userData.bio;
                }
                if (!user.title && userData.title) {
                  user.title = userData.title;
                }
              }
              user.save(function (err) {
                if (err) { return done(null, false, { message: 'An error occurred while logging on. Please try again.' }); }
                return done(null, user);
              });
            }
            // Invalid password
            else {
              user.passwordAttempts++;
              user.save(function (err) {
                if (err) { return done(null, false, { message: 'An error occurred while logging on. Please try again.' }); }
                return done(null, false, { message: 'Invalid email address or password.' });
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
      username: null,
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
    var self = this;
    if (!_.isFinite(userId)) {
      return cb({ message: 'User ID must be a numeric value' }, null);
    }
    User.findOneById(userId, function (err, user) {
      if (err) { return cb(err, null); }
      delete user.deletedAt;
      if (userId != reqId) {
        user = self.cleanUser(user);
      }
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
  },

  /**
   * Validate a password based on OWASP password rules.
   * @param username the user's name or email
   * @param password the user's proposed password
   * @return an object returning keys set to true where the rule passes,
   *         false if the rule failed.
   */
  validatePassword: function (username, password) {
    var rules = {
      username: false,
      length: false,
      upper: false,
      lower: false,
      number: false,
      symbol: false
    };
    var _username = username.toLowerCase().trim();
    var _password = password.toLowerCase().trim();
    // check username is not the same as the password, in any case
    if (_username != _password && _username.split('@',1)[0] != _password) {
      rules['username'] = true;
    }
    // length > 8 characters
    if (password && password.length >= 8) {
      rules['length'] = true;
    }
    // Uppercase, Lowercase, and Numbers
    for (var i = 0; i < password.length; i++) {
      var test = password.charAt(i);
      // from http://stackoverflow.com/questions/3816905/checking-if-a-string-starts-with-a-lowercase-letter
      if (test === test.toLowerCase() && test !== test.toUpperCase()) {
        // lowercase found
        rules['lower'] = true;
      }
      else if (test === test.toUpperCase() && test !== test.toLowerCase()) {
        rules['upper'] = true;
      }
      // from http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
      else if (!isNaN(parseFloat(test)) && isFinite(test)) {
        rules['number'] = true;
      }
    }
    // check for symbols
    if (/.*[^\w\s].*/.test(password)) {
      rules['symbol'] = true;
    }
    return rules;
  }
};
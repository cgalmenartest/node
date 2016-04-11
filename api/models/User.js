/**
 * User.js
 *
 * @description :: User model, unique by email
 */
var crypto    = require('crypto');

module.exports = {
  schema: true,
  tableName: 'midas_user',
  attributes: {
    username: { type: 'email', unique: true },
    passports: { collection: 'Passport', via: 'user' },

    // Core attributes that appear in the user's profile
    name: 'STRING',    // Identifies people on the site
    title: 'STRING',   // Professional Title
    bio: 'STRING',     // Biography

    // Tag association
    tags: {
      collection: 'tagEntity',
      via: 'users',
      dominant: true
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.passports;
      return obj;
    },
  },
  beforeValidate: function(values, done) {
    if ( values && values.username ) {
      values.username = values.username.toLowerCase();
    }
    done();
  },
  register: function(attributes, done) {
    User.create({
      username : attributes.username,
      name: attributes.name,
      tags: attributes.tags
    }, function (err, user) {
      if (err) {
        // used to set req.flash: Error.Passport.User.Exists
        sails.log.verbose('register: failed to create user ', attributes.username);
        return done(err);
      }
      // Generating accessToken for API authentication
      var token = crypto.randomBytes(48).toString('base64');

      Passport.create({
        protocol    : 'local'
      , password    : attributes.password
      , user        : user.id
      , accessToken : token
      }, function (err, passport) {
        if (err) {
          // used to set req.flash: Error.Passport.Password.Invalid
          sails.log.verbose('register: failed to create passport for user ', user.id);
          return user.destroy(function (destroyErr) {
            done(destroyErr || err);
          });
        }

        done(null, user);
      });
    });

  }
};

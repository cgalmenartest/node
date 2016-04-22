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
    badges: { collection: 'badge', via: 'user'},

    // Core attributes that appear in the user's profile
    name: 'STRING',    // Identifies people on the site
    title: 'STRING',   // Professional Title
    bio: 'STRING',     // Biography

    // User's profile photo
    // If photoId is not null, the URL to the file is /file/get/:id
    photoId: 'INTEGER',
    // If photoUrl is not null, then an external provider gave us the photo
    // Use the URL directly as the resource identifier for the photo.
    photoUrl: 'STRING',

    // User metadata for service delivery
    isAdmin: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // User is an admin for their agency
    isAgencyAdmin: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // is the user's login disabled
    disabled: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // Store the number of invalid password attempts
    passwordAttempts: {
      type: 'INTEGER',
      defaultsTo: 0
    },

    // Store the number of completedTasks
    completedTasks: {
      type: 'INTEGER',
      defaultsTo: 0
    },

    // Tag association
    tags: {
      collection: 'tagEntity',
      via: 'users',
      dominant: true
    },

    /**
     * Increment the task counter by one and
     * check to see if a badge should be awarded
     *
     * @param { Task } task
     * @param { Object } opts
     */
    taskCompleted: function ( task, opts ) {
      var user = this;
      opts = opts || {};
      user.completedTasks += 1;
      this.save( function ( err, u ) {
        if ( err ) { return sails.log.error( err ); }
        Badge.awardForTaskCompletion( task, user, opts );
      } );
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

/**
 * User.js
 *
 * @description :: User model, unique by email
 */

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

};

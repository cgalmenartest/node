/**
 * UserEmail
 *
 * @module      :: Model
 * @description :: Email addresses for users
 *
 */

module.exports = {

  attributes: {

    // Reference to the user object
    userId: 'INTEGER',

    // Email address
    email: 'EMAIL',

    // Designate primary contact?
    isPrimary: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // Has the email address been verified?
    isVerified: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // Verification token for this email address
    token: 'STRING'

  },

  afterUpdate: function (values, cb) {
    User.update(values.userId, { username: values.email }, cb);
  }

};

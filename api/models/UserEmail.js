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
    }

  }

};

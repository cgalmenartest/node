/**
 * User
 *
 * @module      :: Model
 * @description :: User representation
 *
 */

module.exports = {

  attributes: {
    // Login information
    username: 'STRING',
    // password generally will not be used; instead OAuth credentials will be verified
    password: 'STRING',

    // Core attributes about a user
    name: 'STRING',
    email: 'STRING',
    photoUrl: 'STRING',

    // User metadata for service delivery
    isAdmin: 'BOOLEAN'
  }

};

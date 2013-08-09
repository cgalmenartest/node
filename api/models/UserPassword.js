/**
 * UserInfo
 *
 * @module      :: Model
 * @description :: **PRIVATE** user hashed passwords
 *
 */

module.exports = {

  attributes: {

    // Reference to the user object
    userId: 'INTEGER',
    // For when local authentication is used
    password: 'STRING',

  }

};

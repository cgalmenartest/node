/**
 * UserPasswordReset
 *
 * @module      :: Model
 * @description :: Reset tokens for allowing a user to reset their password
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    // User that has requested the password reset
    userId: 'INTEGER',
    // Generated token, valid for a period of time
    token: 'STRING'

  }

};

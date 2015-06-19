/**
 * UserPasswordReset
 *
 * @module      :: Model
 * @description :: Reset tokens for allowing a user to reset their password
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var uuid = require('node-uuid');

module.exports = {

  attributes: {

    // User that has requested the password reset
    userId: 'INTEGER',
    // Generated token, valid for a period of time
    token: 'STRING'

  },
  beforeCreate: function (values, cb) {
    // generate a unique token based on uuid
    values.token = uuid.v4();
    cb(null, values);
  },

  afterCreate: function(model, done) {
    Notification.create({
      action: 'userpasswordreset.create.token',
      model: model
    }, done);
  }

};

/**
 * Source definition for
 *
 * @module    :: audience.js
 * @description :: defines service functions that return collections of users
 */
var _ = require('underscore');
var utils = require('./utils');

module.exports = {
  execute: function (fields, settings, cb) {
    User.find({id: fields.volunteerId}).exec(cb);
  }
};

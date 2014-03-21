/**
 * Source definition for
 *
 * @module    :: audience.js
 * @description :: defines service functions that return collections of users
 */
 var util = require('util');
 var events = require('events');
 var _ = require('underscore');
 var async = require('async');

// convenience function that accepts a collection of entities with a property "userId" (must be exact) and returns a collection of those users
function convertToUsers (err, userIdPropertyCollection, cb) {
  var uIds = [];
  _.each(userIdPropertyCollection, function (item) {
    uIds.push(item.userId);
  });
  if (uIds.length > 0) {
    User.find({
      where: { id: uIds }
    }).done(cb);
  }
  else {
    cb(null, []);
  }
};

module.exports = {

  execute: function (fields, settings, cb) {

  }

}
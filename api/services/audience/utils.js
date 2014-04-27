/**
 * Source definition for
 *
 * @module    :: utils.js
 * @description :: Utilities for audience finders
 */
var _ = require('underscore');

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
  convertToUsers: convertToUsers
};

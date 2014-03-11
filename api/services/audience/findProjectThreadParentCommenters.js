/**
 * Source definition for
 *
 * @module    :: audience.js
 * @description :: defines service functions that return collections of users
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
  execute: function (fields, settings, cb) {
    Comment.find({id : fields.commentId }).done(function (err, comments) {
      if(!err && comments.length > 0){
        var comment = comments.pop();
        // get all parent comments
        sails.services.utils['comment'].commentParentThreadAssemble(comment, {}, function (err, comments){
          if(!err){
            convertToUsers(err, comments, cb);
          }
          else {
            cb(err, []);
          }
        });
      }
      else {
        cb(err, []);
      }
    });
  }
}
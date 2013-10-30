/**
 * Gets all the tags given a particular
 * where clause, allowing flexibly fetching
 * tags for different parts of the application,
 * such as projects, tasks, or people.
 *
 * Example: commentAssemble({ projectId: id }, function (err, comments) { });
 */
var tagAssemble = function (where, done) {
  Tag.find()
  .where(where)
  .exec(function (err, tags) {
    if (err) { return done(err, null); }
    if (!tags || (tags.length == 0)) { return done(null, []); }
    var entities = {};
    var tagIds = [];

    // Helper function for async to look up each tag entitiy
    var getTags = function (tagId, next) {
      if (entities[tagId]) { return next(); }
      TagEntity.findOne(tagId, function (err, t) {
        entities[tagId] = t;
        next(err);
      });
    }

    // Get all the tag ids
    for (var i = 0; i < tags.length; i++) {
      tagIds.push(tags[i].tagId);
    }

    // Get the tag entities for each id
    async.each(tagIds, getTags, function(err) {
      if (err) { return done(err, null); }
      // Attach the tag entity to the tag
      for (var i = 0; i < tags.length; i++) {
        tags[i].tag = entities[tags[i].tagId];
      }
      return done(null, tags);
    });
  });
};

module.exports = {
  assemble: tagAssemble
};

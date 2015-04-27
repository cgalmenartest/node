var async = require('async');
var userUtil = require('./user');

/**
 * Determine if a user has access to project
 * Callback: function(err, proj)
 * If both err and proj are null, then project
 * was found but access is denied.
 */
var authorized = function (id, userId, cb) {
  Project.findOneById(id).populate('tags').exec(function (err, proj) {
    if (err || !proj) { return cb('Error finding project.', null); }
    // otherwise, check that we have an owner
    ProjectOwner.findByProjectId(proj.id, function(err, owners) {
      if (err) { return cb('Error looking up owners.', null); }
      proj.owners = [];
      proj.isOwner = false;
      for (var i = 0; i < owners.length; i++) {
        if (userId && (owners[i].userId == userId)) {
          proj.isOwner = true;
        }
        proj.owners.push({ id: owners[i].id, userId: owners[i].userId });
      }
      // If project is open and closed/finished, continue
      if ((proj.state === 'open') || (proj.state === 'closed') || (proj.isOwner)) {
        return cb(null, proj);
      }
      else {
        return cb(null, null);
      }
    });
  });
};

var getMetadata = function(proj, user, cb) {
  proj.like = false;

  Like.countByProjectId( proj.id, function (err, likes) {
    if (err) { return cb(err, proj); }
    proj.likeCount = likes;
    async.each(proj.owners, userUtil.addUserName, function (err) {
      if (err) { return cb(err, proj); }
      if (!user) {
        return cb(null, proj);
      }
      Like.findOne({ where: { userId: user.id, projectId: proj.id }}, function (err, like) {
        if (err) { return cb(err, proj); }
        if (like) { proj.like = true; }
        return cb(err, proj);
      });
    });
  });
};

var addCounts = function(proj, done) {
  // Count the number of comments
  Comment.count()
  .where({ projectId: proj.id })
  .exec(function (err, commentCount) {
    if (err) return done(err);
    proj.commentCount = commentCount;
    // Count the number of owners
    ProjectOwner.count()
    .where({ projectId: proj.id })
    .exec(function (err, ownerCount) {
      if (err) return done(err);
      proj.ownerCount = ownerCount;
      // Count the number of tasks
      Task.count()
      .where({ projectId: proj.id })
      .exec(function (err, taskCount) {
        if (err) return done(err);
        proj.taskCount = taskCount;
        done();
      });
    });
  });
};

module.exports = {
  getMetadata: getMetadata,
  authorized: authorized,
  addCounts: addCounts
};

/**
 * Determine if a user has access to a task
 * Callback: function(err, task)
 * If both err and task are null, then task
 * was found but access is denied.
 */
var project = require('./project');

var authorized = function (id, userId, cb) {
  Task.findOneById(id, function (err, task) {
    if (err) { return cb('Error finding task.', null); }
    // otherwise, check that we have an owner
    if (task.userId == userId) {
      return cb(null, task);
    }
    // If not the owner, check if there is a project
    if (!task.projectId) {
      if ((task.state === 'public') || (task.state == 'closed')) {
        return cb(null, task);
      }
      return cb(null, null);
    }
    // check if the user is authorized for the project
    // or the project is public
    util.authorized(task.projectId, userId, function (err, proj) {
      if (err) { return cb(err, null); }
      if (!err && !proj) { return cb(null, null); }
      // user has access to the project, but is not the task owner
      // check the task state to make sure it is publicly accessible
      if ((task.state === 'public') || (task.state == 'closed')) {
        return cb(null, task);
      }
      // In any other state, you have to be the owner.  Denied.
      return cb(null, null);
    });
  });
};

module.exports = {
  authorized: authorized
};

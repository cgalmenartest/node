/**
 * Get the task referenced in projectId of the request body
 * and check if access is allowed
 */
var util = require('../services/utils/task');

module.exports = function taskId(req, res, next) {
  console.log('task policy ',req.body.taskId);
  if (req.body && req.body.taskId) {
  console.log('task policy executung');

    // TODO: authorize task based on user
    // var userId = null;
    // if (req.user) {
    //   userId = req.user[0].id;
    // }

    Task.authorized(req.body.taskId, function(err, task) {
      if (err) {
        return res.send({ message: err });
      }
      if (!task) {
        return res.send(403, { message: 'Not authorized.' });
      }
      req.task = task;
      req.taskId = task.id;
      req.isOwner = task.isOwner;
      next();
    });
    // no :id is specified, so continue
  } else {
    next();
  }
};

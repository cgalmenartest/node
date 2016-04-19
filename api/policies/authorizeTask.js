/**
 * Get the task referenced in projectId of the request body
 * and check if access is allowed
 */
module.exports = function authorizeTask(req, res, next) {
  sails.log.verbose("authorizeTask", req.params)
  if (req.params['id']) {
    // TODO: authorize task based on user
    // var userId = null;
    // if (req.user) {
    //   userId = req.user.id;
    // }

    Task.authorized(req.params.id, function(err, task) {
      if (err) {
        return res.send({ message: err });
      }
      if (!task) {
        return res.send(403, { message: 'Not authorized.' });
      }
      sails.log.verbose("authorized:", task)
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

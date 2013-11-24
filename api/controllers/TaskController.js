/**
 * TaskController
 *
 * @module    :: Controller
 * @description :: Interaction with tasks
 */
var taskUtil = require('../services/utils/task');
var tagUtil = require('../services/utils/tag');

module.exports = {

  find: function (req, res) {
    if (req.task) {
      var user = null;
      if (req.user) {
        user = req.user[0];
      }
      taskUtil.getMetadata(req.task, user, function (err) {
        if (err) { return res.send(400, { message: 'Error looking up task likes.' }); }
        taskUtil.getVolunteers(req.task, function (err) {
          if (err) { return res.send(400, { message: 'Error looking up task volunteers.' }); }
          return res.send(req.task);
        });
      });
      return;
    }
    Task.find()
    .where({ state: 'public' })
    .sort({'updatedAt': -1})
    .exec(function (err, tasks) {
      if (err) { return res.send(400, { message: 'Error looking up tasks.' }); }
      async.each(tasks, taskUtil.getTags, function (err) {
        if (err) { return res.send(400, { message: 'Error looking up task tags.' }); }
        async.each(tasks, taskUtil.getLikes, function (err) {
          if (err) { return res.send(400, { message: 'Error looking up task likes.' }); }
          return res.send({ tasks: tasks });
        });
      });
    });
  },

	findAllByProjectId: function (req, res) {
		Task.findByProjectId(req.params.id, function(err, tasks) {
			if (err) return res.send(err, 500);
			res.send({ tasks: tasks });
		});
	}

};

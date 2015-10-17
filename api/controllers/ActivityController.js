module.exports = {

  badges: function(req, res) {
    var events = [];
    Task.find({
      state: 'completed',
      sort: 'completedAt DESC',
      limit: 25
    }).exec(function(err, tasks) {
      if (err) return res.negotiate(err);
      Volunteer.find({ taskId: _.pluck(tasks, 'id') }).exec(function(err, vols) {
        if (err) return res.negotiate(err);
        User.find({ id: _.pluck(vols, 'userId') }).exec(function(err, users) {
          if (err) return res.negotiate(err);
          tasks.forEach(function(task) {
            var ids = _(vols).chain()
                  .where({ taskId: task.id })
                  .pluck('userId').value(),
                participants = _.filter(users, function(user) {
                  return _.contains(ids, user.id);
                });
            events.push({
              type: 'taskCompleted',
              task: task,
              participants: participants
            });
            participants.forEach(function(user) {
              events.push({
                type: 'participantBadge',
                task: task,
                user: user
              });
            });
          });
          res.send(events);
        });
      });
    });
  },

  users: function(req, res) {
    // TODO: include new tasks and volunteer events for
    // "agency posted a task" or "participant signed up"
    var events = [];
    Notification.find({
      action: 'user.create.welcome',
      sort: 'createdAt DESC',
      limit: 10
    }).exec(function(err, events) {
      if (err) return res.negotiate(err);
      User.find({
        id: _(events).pluck('model').compact().pluck('id').value(),
        sort: 'createdAt DESC'
      }).exec(function(err, users) {
        if (err) return res.negotiate(err);
        return res.send(users);
      });
    });
  },

  network: function(req, res) {
    var query = JSON.parse(req.param('where', '{}')),
        where = _.extend(query, { state: 'completed' });
    Task.find(where).exec(function(err, tasks) {
      if (err) return res.negotiate(err);
      var ids = _.pluck(tasks, 'id');
      Volunteer.count({ userId: ids }).exec(function(err, count) {
        if (err) return res.negotiate(err);
        res.json(count);
      });
    });
  },

  count: function(req, res) {
    var where = req.param('where', {});
    Task.count(where).exec(function(err, count) {
      if (err) return res.negotiate(err);
      res.json(count);
    });
  }

};

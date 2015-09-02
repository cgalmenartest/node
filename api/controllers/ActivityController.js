var async = require('async');

module.exports = {

  badges: function(req, res) {
    var events = [];
    Task.find({
      state: 'completed',
      sort: 'completedAt DESC'
    }).exec(function(err, tasks) {
      if (err) return res.negotiate(err);
      async.eachSeries(tasks, function(task, next) {
        Volunteer.find({ taskId: task.id}).exec(function(err, vols) {
          if (err) return res.negotiate(err);
          User.find({ id: _.pluck(vols, 'userId') }).exec(function(err, users) {
            if (err) return res.negotiate(err);
            events.push({
              type: 'taskCompleted',
              task: task,
              participants: users
            });
            users.forEach(function(user) {
              events.push({
                type: 'participantBadge',
                task: task,
                user: user
              });
            });
            next();
          });
        });
      }, function() {
        res.send(events);
      });
    });
  },

  users: function(req, res) {
    // TODO: include new tasks and volunteer events for
    // "agency posted a task" or "participant signed up"
    var events = [];
    Notification.find({
      action: 'user.create.welcome'
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
    var query = JSON.parse(req.param('where', '{}')),
        where = _.extend(query, { state: 'completed' });
    Task.count(where).exec(function(err, count) {
      if (err) return res.negotiate(err);
      res.json(count);
    });
  }

};

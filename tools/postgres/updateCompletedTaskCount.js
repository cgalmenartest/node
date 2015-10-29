var Sails = require('sails'),
    async = require('async');

Sails.lift({}, function(err, sails) {
  if (err) return console.error(err);

  User.query('SELECT * FROM midas_user', function(err, results) {
    if (err) return console.error(err);

    async.series(results.rows.map(function(user) {
      return function(cb) {
        calculateCompletedTasks(user.id, cb);
      }
    }), function (err, results) {
      console.log('top err', err);
    });
  });

  function calculateCompletedTasks(userId, cb) {
    Volunteer.find({ userId: userId }).exec(function(err, vols) {
      if (err) return cb(err);
      async.series(vols.map(function(v) {
        return function(callback) {
          Task.findOne({ id: v.taskId }).exec(function(err, task) {
            if (err) return callback(err);
            if (task.state === 'completed') {
              User.findOne({ id: userId }).populate('badges').exec(function(err, user) {
                if (err) return callback(err);

                var oldBadges = user.badges.map(function(i) { return i.id; });
                user.completedTasks += 1;
                user.save(function(err, u){
                  if (err) return callback(err);
                  return callback();
                });
              });
            }
            return callback(null, 'task wasn\'t completed yet');
          });
        }
      }), function (err, results) {
        if (err) return cb(err);
        cb(null, results);
      });

    });
  }

});

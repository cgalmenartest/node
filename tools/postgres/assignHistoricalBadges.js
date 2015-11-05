var Sails = require('sails'),
    async = require('async');

Sails.lift({}, function(err, sails) {
  if (err) return console.error(err);

  Task.find({ state: 'completed' }).exec(function(err, tasks) {
    if (err) return console.error(err);

    var ts = tasks.map(function(task) {
      return function(callback) {
        Volunteer.find({ taskId: task.id }).exec(function(err, vols) {
          if (err) return callback(err);

          var volUserIds = vols.filter(function(v) {
            return v.userId;
          }).map(function(v) {
            return v.userId;
          });

          if (volUserIds.length === 0) return callback();

          User.find({ id: volUserIds }).exec(function(err, users) {
            if (err) return callback(err);

            async.series(users.map(function(user) {
              return function(cb) {
                user.completedTasks += 1;
                user.save(function(err, u){
                  // nothing happens in this function because
                  // its unreliable for sails to call the callback
                });
                setTimeout(function() { cb(); }, 1000);
              }
            }), function(err, result) {
              if (err) callback(err);
              callback(null, result);
            });

          });

        });
      }
    });

    async.series(ts, function(err, result) {
      console.log('all done');
      console.log('error', err);
      Sails.lower();
    });

  });

});

var Sails = require('sails'),
    async = require('async');

Sails.lift({}, function(err, sails) {
// use nested async loops because the .findOrCreate() isn't
// transactional, which means that at a high frequency it
// doesn't ensure that duplicate records don't get created
  Task.find({ state: 'completed' }).exec(function(err, tasks) {
    var ts = tasks.map(function(task, taskIndex) {
      return function(cb) {
        console.log('Assigning badges for ' + taskIndex + ' of ' + tasks.length + ' tasks.');
        Volunteer.find({ taskId: task.id }).exec(function(err, volunteers){

          var vs = volunteers.map(function(vol) {
            return function(callback) {
              User.findOne({ id: vol.userId }).exec(function(err, user) {
                user.taskCompleted(task);
                setTimeout(function(){ callback(); }, 500);
              });
            };
          });

          async.series(vs, function(err, result) {
            cb();
          });

        });
      };
    });

    async.series(ts, function(err, result) {
      Sails.lower();
    });

  });
});

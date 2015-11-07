var async = require('async');

function Decorator(data, callback) {
  this.data = data;
  this.callback = callback;
};

Decorator.prototype.addMetrics = function() {
  this.setLockedAttribute();
};

Decorator.prototype.setLockedAttribute = function() {
  this.data.locked = false;
  var passwordAttemptLimit = sails.config.auth.auth.local.passwordAttempts;
  if (this.data.passwordAttempts >= passwordAttemptLimit) {
    this.data.locked = true;
  }
};

var addUserMetrics = function(user, callback) {
  var decorator = new Decorator(user, callback);
  decorator.addMetrics();

  async.parallel([
    // add project counts
    function(done) {
      // add created projects
      user.projectsCreatedOpen = 0;
      user.projectsCreatedClosed = 0;

      ProjectOwner.find().where({userId: user.id}).exec(function(err, owners) {
        if (err) { done('Failed to retrieve ProjectOwners ' +  err);}

        if (owners.length !== 0) {
          var projIds = [];
          for (var j in owners) {
            projIds.push(owners[j].projectId);
          }
          Project.find().where({id: projIds}).exec(function(err, projects) {
            if (err) { done('Failed to retrieve projects ' +  err);}
            async.each(projects, function(project, cb) {
              if (project.state === "open") {
                user.projectsCreatedOpen++;
                cb();
              }
              else {
                user.projectsCreatedClosed++;
                cb();
              }
            }, function(err) {
              done(null);
            });
          });
        } else {
          done(null);
        }
      });
    },
    // add task counts
    function(done) {
      user.tasksCreatedOpen = 0;
      user.tasksCreatedAssigned = 0;
      user.tasksCreatedCompleted = 0;
      user.tasksCreatedArchived = 0;
      async.parallel([
        function(cb) {
          Task.countByState("open").where({userId:user.id}).exec(function(err, openCount) {
            user.tasksCreatedOpen = openCount;
            cb();
          });
        },
        function(cb) {
          Task.countByState("assigned").where({userId:user.id}).exec(function(err, assignedCount) {
            user.tasksCreatedAssigned = assignedCount;
            cb();
          });
        },
        function(cb) {
          Task.countByState("completed").where({userId:user.id}).exec(function(err, completedCount) {
            user.tasksCreatedCompleted = completedCount;
            cb();
          });
        },
        function(cb) {
          Task.countByState("archived").where({userId:user.id}).exec(function(err, archivedCount) {
            user.tasksCreatedArchived = archivedCount;
            cb();
          });
        }], function(err) {
          done(null);
        });
    },
    // add volunteer counts
    function(done) {
      user.volCountOpen = 0;
      user.volCountAssigned= 0;
      user.volCountCompleted = 0;
      user.volCountArchived = 0;
      Volunteer.find().where({userId:user.id}).exec(function(err, volunteers) {
        if (err) { done('Failed to retrieve volunteers ' +  err);}
        if (volunteers.length !== 0) {
          var taskIds = [];
          for (var i in volunteers) {
            taskIds.push(volunteers[i].taskId);
          }
          Task.find().where({id: taskIds}).exec(function(err, tasks) {
            if (err) { done('Failed to retrieve tasks for volunteers ' +  err);}
            async.each(tasks, function(task, cb) {
              if (task.state === "open") {
                user.volCountOpen++;
                cb();
              }
              else if (task.state === "assigned") {
                user.volCountAssigned++;
                cb();
              }
              else if (task.state === "completed") {
                user.volCountCompleted++;
                cb();
              }
              else if (task.state === "archived") {
                user.volCountArchived++;
                cb();
              }
              else {
                cb();
              }
            }, function(err) {
              done(null);
            });
          });
        } else {
          done(null);
        }
      });
    }], function(err) {
      callback(null);
    });
};

module.exports = {
  add: addUserMetrics
};

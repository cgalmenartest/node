var async = require('async');
var _ = require('underscore');

function Decorator(data, callback) {
  this.data = data;
  this.callback = callback;
};

Decorator.prototype.addMetrics = function() {
  this.setLockedAttribute();
};

Decorator.prototype.curryHandler = function(handler, collectionName, done) {
  console.log('handling', handler, collectionName);
  var handler = handler.bind(this);

  return function(err, collection) {
    if (err) {
      done('Failed to retrieve' + collectionName + ' ' + err);
    } else if (collection.length == 0) {
      done(null);
    } else {
      handler(err, collection, done);
    }
  };
};

Decorator.prototype.setLockedAttribute = function() {
  this.data.locked = false;
  var passwordAttemptLimit = sails.config.auth.auth.local.passwordAttempts;
  if (this.data.passwordAttempts >= passwordAttemptLimit) {
    this.data.locked = true;
  }
};

Decorator.prototype.setProjectStats = function(done) {
  this.data.projectsCreatedOpen = 0;
  this.data.projectsCreatedClosed = 0;

  ProjectOwner.find().where({userId: this.data.id}).exec(function(err, owners) {
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
            this.data.projectsCreatedOpen++;
            cb();
          }
          else {
            this.data.projectsCreatedClosed++;
            cb();
          }
        }.bind(this), function(err) {
          done(null);
        });
      }.bind(this));
    } else {
      done(null);
    }
  }.bind(this));
};

Decorator.prototype.findOwnedProjects = function(err, owners, done) {
  var projIds = _.pluck(owners, 'projectId');

  Project.find().where({id: projIds}).exec(
    this.curryHandler(this.sortProjectAndAddMetrics, 'Projects', done)
  );
}

Decorator.prototype.sortProjectAndAddMetrics = function(err, projects, done) {
  var openProjectCount = _.countBy(projects, function(project) {
    return project.state == 'open';
  });

  this.data.projectsCreatedOpen = openProjectCount;
  this.data.projectsCreatedClosed = projects.length - openProjectCount;

  done();
}

var addUserMetrics = function(user, callback) {
  var decorator = new Decorator(user, callback);
  decorator.addMetrics();

  async.parallel([
    decorator.setProjectStats.bind(decorator),

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

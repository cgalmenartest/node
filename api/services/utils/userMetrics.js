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

// TODO: this could probably be handled better by an association!
Decorator.prototype.setProjectStats = function(done) {
  this.data.projectsCreatedOpen = 0;
  this.data.projectsCreatedClosed = 0;

  ProjectOwner.find().where({userId: this.data.id}).exec(this.curryHandler(this.findOwnedProjects, 'Owners', done));
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

  this.data.projectsCreatedOpen = openProjectCount[true];
  this.data.projectsCreatedClosed = openProjectCount[false];

  done();
}

Decorator.prototype.setTaskStats = function(done) {
  this.data.tasksCreatedOpen = 0;
  this.data.tasksCreatedAssigned = 0;
  this.data.tasksCreatedCompleted = 0;
  this.data.tasksCreatedArchived = 0;

  async.parallel([
    this.countTaskType('open', 'tasksCreatedOpen'),
    this.countTaskType('assigned', 'tasksCreatedAssigned'),
    this.countTaskType('completed', 'tasksCreatedCompleted'),
    this.countTaskType('archived', 'tasksCreatedArchived')
  ], function(err) { done(null); });
};

Decorator.prototype.countTaskType = function(state, countName) {
  var user = this.data;
  return function(next) {
    Task.countByState(state).where({userId: user.id}).exec(function(err, count) {
      user[countName] = count;
      next();
    }.bind(this));
  }.bind(this);
};

var addUserMetrics = function(user, callback) {
  var decorator = new Decorator(user, callback);
  decorator.addMetrics();

  async.parallel([
    decorator.setProjectStats.bind(decorator),
    decorator.setTaskStats.bind(decorator),

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

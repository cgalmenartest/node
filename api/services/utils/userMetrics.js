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
    return project.state;
  });

  this.data.projectsCreatedOpen = openProjectCount['open'];
  this.data.projectsCreatedClosed = projects.length - openProjectCount['open'];

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

Decorator.prototype.setVolunteerStats = function(done) {
  this.data.volCountOpen = 0;
  this.data.volCountAssigned= 0;
  this.data.volCountCompleted = 0;
  this.data.volCountArchived = 0;

  Volunteer.find().where({userId: this.data.id}).exec(
    this.curryHandler(this.findVolunteeredTasks, 'Volunteers', done)
  );
};

Decorator.prototype.findVolunteeredTasks = function(err, volunteers, done) {
  taskIds = _.pluck(volunteers, 'taskId');
  Task.find().where({id: taskIds}).exec(
    this.curryHandler(this.sortAndCountVolunteeredTasks, 'volunteered tasks', done)
  );
};

Decorator.prototype.sortAndCountVolunteeredTasks = function(err, tasks, done) {
  var taskCounts = _.countBy(tasks, function(task) {
    return task.state;
  });

  this.data.volCountOpen = taskCounts['open'];
  this.data.volCountAssigned = taskCounts['assigned'];
  this.data.volCountCompleted = taskCounts['completed'];
  this.data.volCountArchived = taskCounts['archived'];

  done();
};

var addUserMetrics = function(user, callback) {
  var decorator = new Decorator(user, callback);
  decorator.addMetrics();

  async.parallel([
    decorator.setProjectStats.bind(decorator),
    decorator.setTaskStats.bind(decorator),
    decorator.setVolunteerStats.bind(decorator)
  ], function(err) { callback(null); });
};

module.exports = {
  add: addUserMetrics
};

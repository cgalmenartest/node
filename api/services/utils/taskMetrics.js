var _ = require('underscore');
var async = require('async');

var TaskDecorator =           require(__dirname + "/taskMetrics/taskDecorator");
var StateMetrics =            require(__dirname + "/taskMetrics/stateMetrics");
var VolunteerAgencyMetrics =  require(__dirname + "/taskMetrics/volunteerAgencyMetrics");

function TaskMetrics(params) {
  this.filter = params('filter');
  this.group = params('group');
  this.metrics = {};
}

_.extend(TaskMetrics.prototype, {
  generateMetrics: function(done) {
    this.done = done;
    this.getTasks();
  },

  getTasks: function() {
    Task.find({}).populate('tags').exec(function(err, tasks) {
      if (err) return this.done('task');

      tasks = this.filterTasks(tasks);

      this.tasks = this.decorateTasks(tasks);

      this.createMetrics();
    }.bind(this));
  },

  filterTasks: function(tasks) {
    if (this.filter) {
      tasks = _.filter(tasks, function(task) {
        return _.findWhere(task.tags, { name: filter });
      });
    }
    return tasks;
  },

  decorateTasks: function(tasks) {
    var group = this.group;
    return _.map(tasks, function(task) {
      var decorator = new TaskDecorator(task);
      return decorator.decorate(group);
    });
  },

  createMetrics: function() {
    async.parallel([
      this.generateStateMetrics.bind(this),
      this.generateVolunteerAgencyMetrics.bind(this)
    ], this.done);
  },

  generateStateMetrics: function(next) {
    var stateMetrics = new StateMetrics(this.tasks);
    _.extend(this.metrics, stateMetrics.metrics());
    next();
  },

  generateVolunteerAgencyMetrics: function(next) {
    var generator = new VolunteerAgencyMetrics(this.tasks, this.group);
    generator.calculate(function() {
      _.extend(this.metrics, generator.metrics);
      next();
    }.bind(this));
  }
});

module.exports = TaskMetrics;

var async = require('async');
var assert = require('chai').assert;
var _ = require('underscore');

var conf = require('../../../api/sails/helpers/config');

var TaskMetrics = require('../../../../api/services/utils/taskMetrics');
var DateDecorator = require('../../../../api/services/utils/taskMetrics/dateDecorator');

describe('TaskMetrics', function() {
  var params, generator;

  beforeEach(function(done) {
    params = function(input) { if (input == 'group') return 'week'; }

    User.find().exec(function(err, users) {
      async.each(users, function(foundUser, next) {
        foundUser.destroy(next);
      }, deleteTasks);
    });

    function deleteTasks() {
      Task.find().exec(function(err, tasks) {
        async.each(tasks, function(task, next) {
          task.destroy(next);
        }, done);
      });
    }
  });

  describe('when there are no tasks', function() {
    it('lightly modifies the output', function(done) {
      generator = new TaskMetrics(params);

      generator.generateMetrics(function() {
        assert.deepEqual(generator.metrics.range, []);
        assert.deepEqual(generator.metrics.tasks, {carryOver: {}, published: {}, completed: {}});
        done();
      });
    });
  });

  describe('when there are tasks', function() {
    beforeEach(function(done) {
      var user;
      function createUser() {
        User.create(conf.defaultUser).exec(function(err, newUser) {
          user = newUser;
          createTask();
        });
      }

      function createTask() {
        Task.create({state: 'open', userId: user.id}).exec(function(err, task) {
          done(err);
        });
      };

      // Delete all the users with each test run, otherwise CRASH!
      User.find().exec(function(err, users) {
        async.each(users, function(foundUser, next) {
          foundUser.destroy(next);
        }, createUser);
      });
    });

    it('adds stats for them', function(done) {
      generator = new TaskMetrics(params);
      generator.generateMetrics(function() {
        var decorator = new DateDecorator((new Date()).toISOString());
        var range = decorator.calendarYearWeek();
        assert.deepEqual(generator.metrics.range, [range]);
        assert.equal(generator.metrics.tasks.carryOver[range], 0);
        assert.equal(generator.metrics.tasks.published[range], 1);
        done();
      });
    });
  });

  describe('when there are volunteers', function() {
    var user, agencyUser, tasks;

    beforeEach(function(done) {
      tasks = [];

      function createUsers() {
        async.parallel([
          function(next) {
            User.create(conf.defaultUser).exec(function(err, newUser) {
              user = newUser;
              next();
            });
          },
          function(next) {
            User.create(conf.AgencyRequiredUser).exec(function(err, newUser) {
              agencyUser = newUser;
              next();
            });
          }
        ], createTasks);
      }

      function createTasks() {
        async.parallel([
          function(next) {
            Task.create({state: 'open', userId: user.id}).exec(function(err, task) {
              tasks.push(task);
              next(err);
            });
          },
          function(next) {
            Task.create({state: 'open', userId: user.id}).exec(function(err, task) {
              tasks.push(task);
              next(err);
            });
          }
        ], assignTasks);
      };

      function assignTasks() {
        async.parallel([
          function(next) {
            Volunteer.create({userId: agencyUser.id, taskId: tasks[0].id}).exec(function(err, join) {
              next();
            });
          },
          function(next) {
            Volunteer.create({userId: agencyUser.id, taskId: tasks[1].id}).exec(function(err, join) {
              next();
            });
          }
        ], done);
      }

      // Delete all the users with each test run, otherwise CRASH!
      User.find().exec(function(err, users) {
        async.each(users, function(foundUser, next) {
          foundUser.destroy(next);
        }, createUsers);
      });
    });

    it("should include data for that via the class", function(done) {
      generator = new TaskMetrics(params);
      generator.generateMetrics(function() {
        var decorator = new DateDecorator((new Date()).toISOString());
        var range = decorator.calendarYearWeek();
        assert.equal(generator.metrics.volunteers[range], 2);
        assert.equal(generator.metrics.agencies[range], 0);
        done();
      });
    });
  });
});


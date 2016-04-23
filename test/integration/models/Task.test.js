var chai = require('chai');
var assert = chai.assert;
var tasks = require('../../fixtures/task');
var users = require('../../fixtures/user');
var _ = require('lodash');

describe('TaskModel', function() {
  var task;

  describe('default properties', function() {
    beforeEach(function(done) {
      Task.create({}).then(function(newTask) {
        task = newTask;
        done();
      })
      .catch(done);
    });

    describe('attributes', function() {
      it('state default to configured state', function(done) {
        assert.equal(task.state, sails.config.taskState, 'badge should default to configured state');
        done();
      });
      it('publishedAt defaults to nil', function(done) {
        assert.equal(task.publishedAt, null, 'publishedAt defaults to null');
        done();
      });
      it('assignedAt defaults to nil', function(done) {
        assert.equal(task.assignedAt, null, 'assignedAt defaults to null');
        done();
      });
      it('completedAt defaults to nil', function(done) {
        assert.equal(task.completedAt, null, 'completedAt defaults to null');
        done();
      });
      it('submittedAt defaults to nil', function(done) {
        assert.equal(task.submittedAt, null, 'submittedAt defaults to null');
        done();
      });

    });
    describe('state', function() {
      it('submitted sets submittedAt', function(done) {
        Task.update(task.id, {state: 'submitted'}).exec(function (err, updated_task) {
          if ( err ) { return done( err ); }
          assert(updated_task[0].submittedAt <= new Date(), 'submittedAt not set');
          done();
        });
      });
    });
    describe('.authorized', function() {
      beforeEach(function(done) {
        done();
      });
      describe('without user', function() {
        it('draft and submitted tasks are hidden', function(done) {
          _(['draft', 'submitted'])
            .forEach(function(state) {
              // we have a fixture named for each state
              var task = new Task._model(tasks[state]);
              result = task.authorized(null);
              assert.equal(result, null, "for state "+state);
            })
          done();
        });
        it('public tasks are visible', function(done) {
          _(['open', 'assigned', 'completed', 'archived'])
            .forEach(function(state) {
              // we have a fixture named for each state
              var task = new Task._model(tasks[state]);
              result = task.authorized(null);
              assert.equal(result, task);
            })
          done();
        });
      });
      describe('with user not owner', function() {
        var owner, user;
        beforeEach(function(done) {
          owner = 1;
          user = new Task._model(users.minAttrs);
          user.id = 2
          done();
        });
        it('draft tasks are hidden', function(done) {
          var task = new Task._model(tasks.draft);
          task.userId = owner;
          result = task.authorized(user);
          assert.equal(result, null);
          done();
        });
      });
      describe('with user owner', function() {
        var owner, user;
        beforeEach(function(done) {
          owner = 1;
          user = new Task._model(users.minAttrs);
          user.id = 1
          done();
        });
        it('draft tasks are visible', function(done) {
          var task = new Task._model(tasks.draft);
          task.userId = owner;
          result = task.authorized(user);
          assert.equal(result, task);
          done();
        });
      });

    });
    describe('#authorized', function() {
      var task, user;
      beforeEach(function(done) {
        user = new User._model(users.minAttrs);
        user.id = 1
        Task.create(tasks.open, function(err, record) {
          assert.isNull(err);
          task = record;
          done();
        });
      });
      it('returns the authorized task', function(done) {
        Task.authorized(task.id, user, function(err, result) {
          assert.isNull(err);
          assert.isNotNull(result);
          assert.equal(result.id, task.id);
          assert.equal(result.isOwner, true);
          done();
        });
      });
    });
  });


});

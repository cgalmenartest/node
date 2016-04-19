var chai = require('chai');
var assert = chai.assert;
var tasks = require('../../fixtures/task');
var users = require('../../fixtures/user');

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
  })

  
});

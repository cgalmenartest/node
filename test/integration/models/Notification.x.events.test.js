var chai = require('chai');
var assert = chai.assert;
var taskFixtures = require('../../fixtures/task');
var userFixtures = require('../../fixtures/user');

describe('Notification events', function() {
  var user;
  beforeEach(function(done) {
    User.create(userFixtures.minAttrs)
    .then(function(newUser) {
      user = newUser;
      done();
    }).catch(done);
  })

  describe('for draft tasks', function() {
    var task;
    beforeEach(function(done) {
      Task.create(taskFixtures.draft)
      .then(function(newTask) {
        task = newTask;
        assert.equal(task.owner, user.id);
        done();
      }).catch(done);
    });
    it('should create task.create.draft', function (done) {
        Notification.find().limit(1).sort('id DESC')
        .then(function(notifications) {
          assert.equal(notifications.length, 1, 'a notification should have been found');
          assert.equal(notifications[0].action, 'task.create.draft');
          assert.equal(notifications[0].model.title, task.title);
          done();
        }).catch(done);
    });
  });
  describe('for creating submitted tasks', function() {
    var task;
    beforeEach(function(done) {
      Task.create(taskFixtures.oneTimeSubmitted)
      .then(function(newTask) {
        task = newTask;
        assert.equal(task.owner, user.id);
        done();
      }).catch(done);
    });
    it('should create task.create.thanks', function (done) {
        Notification.find().limit(1).sort('id DESC')
        .then(function(notifications) {
          assert.equal(notifications.length, 1, 'a notification should have been found');
          assert.equal(notifications[0].action, 'task.create.thanks');
          assert.equal(notifications[0].model.title, task.title);
          done();
        }).catch(done);
    });
  });


})

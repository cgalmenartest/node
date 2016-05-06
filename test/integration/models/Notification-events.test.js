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

  it('should create user.create.welcome', function (done) {
      Notification.find().limit(1).sort('id DESC')
      .then(function(notifications) {
        assert.equal(notifications.length, 1, 'a notification should have been generated');
        assert.equal(notifications[0].action, 'user.create.welcome');
        assert.equal(notifications[0].model.username, user.username);
        done();
      }).catch(done);
  });
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
    // this is testing a lot of things, but it is really the
    // important end-user effect and we don't really test
    // this integration elsewhere
    it('when published, should create update and badge events', function(done) {
      Task.update(task.id, {id:task.id, state: 'open'})
      .then(function(openTask) {
        return Notification.find().limit(2).sort('id DESC')
      })
      .then(function(notifications) {
        assert.equal(notifications.length, 2, 'notifications should have been found');
        assert.equal(notifications[0].action, 'badge.create.owner');
        assert.equal(notifications[0].model.badge.type, 'instigator');
        assert.equal(notifications[1].action, 'task.update.opened');
        assert.equal(notifications[1].model.title, task.title);
        // assert.equal(notifications[1].model.title, task.title);
        done();
      }).catch(done);
    })
  });


})

var assert = require('chai').assert;
var sinon = require('sinon');
var taskFixtures = require('../../fixtures/task');
var userFixtures = require('../../fixtures/user');

describe('NotificationModel', function() {

  beforeEach(function(done){
      done();
  });

  describe('#create', function() {
    describe('with data', function() {
      var notification;
      var data, action;

      beforeEach(function(done) {
        data = {name: 'one'};
        action = 'thing.start';
        Notification.create({
          action: action,
          model: data
        })
        .then(function(newNotification) {
          notification = newNotification;
          done()
        })
        .catch(done);
      });

      it('should save attributes', function (done) {
        assert.equal(notification.action, action);
        assert.deepEqual(notification.model, data);
        done();
      });
    });

    it('should call trigger', function (done) {
      var oldTrigger = Notification.trigger;
      var called = false;
      var notification;
      Notification.trigger = function(model, cb) {
        assert.property(model, 'action')
        assert.equal(model.action, 'whatever')
        called = true;
      }
      Notification.create({action: 'whatever'})
      .then(function(notification) {
        assert.equal(called, true);
        Notification.trigger = oldTrigger;
        done();
      })
      .catch(done);
    });
  });


  describe('#trigger', function() {
    var user, task;

    function checkTriggerEmail(data, done) {
      var email;
      Notification._transport.sendMail = function mockSend(options, cb) {
        email = options;
        cb(null);
      };
      Notification.trigger(data, function(err, info) {
        assert.isNull(err);
        done(err, email);
      });
    }

    before(function(done) {
      User.create(userFixtures.minAttrs)
      .then(function(newUser) {
        user = newUser;
        return Task.create(taskFixtures.draft);
      })
      .then(function(newTask) {
        task = newTask
        sails.config.emailProtocol = 'SMTP';
        done();
      }).catch(done);
    })
    after(function() {
      sails.config.emailProtocol = '';
    })

    it('user.create.welcome', function (done) {
      data = {action: 'user.create.welcome', model:user}
      checkTriggerEmail(data, function(err, email) {
        assert.equal(email.to, user.username);
        assert.equal(email.subject, "Welcome to "+sails.config.systemName);
        done();
      })
    });
  });

});

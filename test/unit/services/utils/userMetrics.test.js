var async = require('async');
var assert = require('chai').assert;
var conf = require('../../../api/sails/helpers/config');

var userMetrics = require('../../../../api/services/utils/userMetrics');

describe('userMetrics.add(user, callback)', function() {
  var user, doAssertions;

  beforeEach(function(done){
    function createUser() {
      User.create(conf.defaultUser).exec(function(err, newUser) {
        user = newUser;
        done(err);
      });
    }

    // Delete all the users with each test run, otherwise CRASH!
    User.find().exec(function(err, users) {
      async.each(users, function(foundUser, next) {
        foundUser.destroy(next);
      }, createUser);
    });
  });

  describe('when password attempts not yet exceeded', function() {
    it('sets the user locked attribute to false', function() {
      doAssertions = function() {
        assert.equal(user.locked, false);
        done();
      };

      userMetrics.add(user, doAssertions);
    });
  });

  describe('when password attempts not yet exceeded', function() {
    it('sets the user locked attribute to true', function() {
      doAssertions = function() {
        assert.equal(user.locked, true);
        done();
      };

      user.passwordAttempts = 100;
      userMetrics.add(user, doAssertions);
    });
  });
});

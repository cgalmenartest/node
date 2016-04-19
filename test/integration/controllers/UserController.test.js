var assert = require('chai').assert;
var request = require('supertest');

describe('UserController', function() {
  var users;  // user fixtures loaded fresh for each test
  var newUserAttrs;

  beforeEach(function(done) {
    users = require('../../fixtures/user');
    newUserAttrs = users.minAttrs;
    User.register(newUserAttrs, function(err, user) {
      assert.isNull(err);
      done();
    })
  });

  var isTrueResult = function(res) {
    assert.equal(res.body, true);
  }
  var isFalseResult = function(res) {
    assert.equal(res.body, false);
  }

  describe('when logged in /api/user', function() {
    beforeEach(function(done) {
      request(sails.hooks.http.app)
        .post('/api/auth/local')
        .send({
          identifier: newUserAttrs.username,
          password: newUserAttrs.password,
          json: true
        })
        .expect(200)
        .end(done)
    });
    xit('should return current user info', function (done) {
      request(sails.hooks.http.app)
        .get('/api/user')
        .expect(200)
        .expect(function(res) {
          assert.deepEqual(res.body,{})
        })
        .end(done)
    });
  });


  describe('username', function() {

    describe('invalid new user ID:', function() {
      it('existing user', function (done) {
        request(sails.hooks.http.app)
          .post('/api/user/username/'+newUserAttrs.username)
          .expect(200)
          .expect(isTrueResult)
          .end(done)
      });

      it('existing user with different case', function (done) {
        uppercaseUsername = newUserAttrs.username.toUpperCase();
        request(sails.hooks.http.app)
          .post('/api/user/username/'+uppercaseUsername)
          .expect(200)
          .expect(isTrueResult)
          .end(done)
      });
      it('empty string should', function (done) {
        request(sails.hooks.http.app)
          .post('/api/user/username/')
          .expect(200)
          .expect(isTrueResult)
          .end(done)
      });
      it('non-email string should return false', function (done) {
        request(sails.hooks.http.app)
          .post('/api/user/username/foo')
          .expect(200)
          .expect(isTrueResult)
          .end(done)
      });
    });

    it('should return false if valid email & no user exists', function (done) {
      request(sails.hooks.http.app)
        .post('/api/user/username/foo@bar.gov')
        .expect(200)
        .expect(isFalseResult)
        .end(done)
    });

  });
});

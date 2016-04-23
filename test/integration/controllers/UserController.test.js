var assert = require('chai').assert;
var request = require('supertest');
var resAssert = require('./resAssert');

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

  describe('when logged in /api/user', function() {
    var agent;
    beforeEach(function(done) {
      console.log('beforeEach')
      agent = request.agent(sails.hooks.http.app);
      agent.post('/api/auth/local')
        .send({
          identifier: newUserAttrs.username,
          password: newUserAttrs.password,
          json: true
        })
        .expect(200)
        .end(done)
    });
    it('should return current user info', function (done) {
      agent.get('/api/user')
        .expect(200)
        .expect(function(res) {
          assert.equal(res.body.username, newUserAttrs.username);
          assert.equal(res.body.name, newUserAttrs.name);
          assert.equal(res.body.id, 1);
          assert.isUndefined(res.body['password']);
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
          .expect(resAssert.isTrue)
          .end(done)
      });

      it('existing user with different case', function (done) {
        uppercaseUsername = newUserAttrs.username.toUpperCase();
        request(sails.hooks.http.app)
          .post('/api/user/username/'+uppercaseUsername)
          .expect(200)
          .expect(resAssert.isTrue)
          .end(done)
      });
      it('empty string should', function (done) {
        request(sails.hooks.http.app)
          .post('/api/user/username/')
          .expect(200)
          .expect(resAssert.isTrue)
          .end(done)
      });
      it('non-email string should return false', function (done) {
        request(sails.hooks.http.app)
          .post('/api/user/username/foo')
          .expect(200)
          .expect(resAssert.isTrue)
          .end(done)
      });
    });

    it('should return false if valid email & no user exists', function (done) {
      request(sails.hooks.http.app)
        .post('/api/user/username/foo@bar.gov')
        .expect(200)
        .expect(resAssert.isFalse)
        .end(done)
    });

  });
});

var assert = require('chai').assert;
var request = require('supertest');

describe('AuthController', function() {
  var isValidLogoutConfirmation = function(res) {
    assert.deepEqual(res.body,
      {
        logout: true
      }
    )
  }
  describe('logout', function() {
    it('should return json confirmation', function (done) {
      request(sails.hooks.http.app)
        .post('/api/auth/logout')
        .send({json:true})
        .expect(200)
        .expect(isValidLogoutConfirmation)
        .end(done)
    });

    it('should redirect when not json', function (done) {
      request(sails.hooks.http.app)
        .post('/api/auth/logout')
        .send()
        .expect(302)
        .expect('location',sails.config.ui.home.logged_in_path, done);
    });

  });

  describe('local user', function() {
    var users;  // user fixtures loaded fresh for each test

    beforeEach(function(done) {
      users = require('../../fixtures/user');
      done();
    });

    var isValidMinUserResult = function(res) {
      assert.equal(res.body.name, users.minAttrs.name);
      assert.equal(res.body.username, users.minAttrs.username);
      assert.notProperty(res.body, 'password');
    }
    it('sign up should return json user', function (done) {
      newUserAttrs = users.minAttrs;
      newUserAttrs.json = true;
      request(sails.hooks.http.app)
        .post('/api/auth/local/register')
        .send(newUserAttrs)
        .expect(200)
        .expect(isValidMinUserResult)
        .end(done)
    });
    it('login should return json user', function (done) {
      newUserAttrs = users.minAttrs;
      newUserAttrs.json = true;
      User.register(users.minAttrs, function(err, user) {
        assert.isNull(err);
        request(sails.hooks.http.app)
          .post('/api/auth/local')
          .send({
            identifier: newUserAttrs.username,
            password: newUserAttrs.password,
            json: true
          })
          .expect(200)
          .expect(isValidMinUserResult)
          .end(done)
      })
    });

  });

});

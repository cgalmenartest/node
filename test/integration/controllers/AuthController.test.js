var assert = require('chai').assert;
var request = require('supertest');

describe('AuthController', function() {

  var isValidLogoutConfirmation = function (res) {
    assert.deepEqual(res.body,
      {
        logout: true
      }
    )
  }
  describe('#logout', function() {
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

});

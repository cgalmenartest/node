var assert = require('chai').assert;
var request = require('supertest');

describe('AdminController', function() {
  describe('when not logged in', function() {
    it('shoud block access', function (done) {
      //TODO: should test all URLs here
      request(sails.hooks.http.app)
        .get('/api/admin/taskmetrics')
        .expect(403)
        .end(done)
    });
  });
  describe('when logged in as regular user', function() {
    var agent;
    beforeEach(function(done) {
      users = require('../../fixtures/user');
      newUserAttrs = users.minAttrs;
      User.register(newUserAttrs, function(err, user) {
        assert.isNull(err);
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
    });

    it('shoud block access', function (done) {
      request(sails.hooks.http.app)
        .get('/api/admin/taskmetrics')
        .expect(403)
        .end(done)
    });

  });

  describe('when logged in as admin user', function() {
    var agent;
    beforeEach(function(done) {
      users = require('../../fixtures/user');
      newUserAttrs = users.minAttrs;
      newUserAttrs.isAdmin = true;
      User.register(newUserAttrs, function(err, user) {
        assert.isNull(err);
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
    });

    it('shoud allow access', function (done) {
      request(sails.hooks.http.app)
        .get('/api/admin/taskmetrics')
        .expect(200)
        .end(done)
    });
  });



});

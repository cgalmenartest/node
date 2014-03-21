var assert = require('assert');
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var request;

describe('user:', function() {
  before(function() {
    request = utils.init();
  });

  it('not logged in', function(done) {
    request(conf.url + '/user', function(err, response, body) {
      if (err) { return done(err); }
      // Not logged in users should get a 403
      assert.equal(response.statusCode, 403);
      done();
    });
  });
  it('register', function (done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.testUser.username, password: conf.testUser.password, json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      assert.equal(response.statusCode, 403);
      request.post({ url: conf.url + '/auth/register',
                     form: { username: conf.testUser.username, password: conf.testUser.password, json: true },
                   }, function (err, response, body) {
        if (err) { return done(err); }
        // Successful login or creation should be a 200 json object
        assert.equal(response.statusCode, 200);
        done();
      });
    });
  });
  it('logout', function (done) {
    request(conf.url + '/auth/logout', function (err, response, body) {
      if (err) { return done(err); }
      // Not logged in users should get a 403
      assert(response.statusCode === 302);
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403
        assert(response.statusCode === 403);
        done();
      });
    });
  });
  it('login bad password', function (done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.testUser.username, password: conf.testUser.password + 'baz', json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      // Successful login or creation should result in a 302 redirect
      assert.equal(response.statusCode, 403);
      // Check if the user is logged in
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403
        assert.equal(response.statusCode, 403);
        done();
      });
    });
  });
  it('login success', function (done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.testUser.username, password: conf.testUser.password, json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      // Successful login or creation should result in a 200 unauthorized
      assert.equal(response.statusCode, 200);
      // Check if the user is logged in
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, conf.testUser.username);
        done();
      });
    });
  });
});

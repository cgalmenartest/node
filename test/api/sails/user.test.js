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
      assert(response.statusCode === 403);
      done();
    });
  });
  it('create', function(done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.username, password: conf.password },
                 }, function(err, response, body) {
      if (err) { return done(err); }
      // Successful login or creation should result in a 302 redirect
      assert(response.statusCode === 302);
      // Should be redirected to /projects
      assert(body.indexOf('/projects') !== -1);
      done();
    });
  });
  it('logout', function(done) {
    request(conf.url + '/auth/logout', function(err, response, body) {
      if (err) { return done(err); }
      // Not logged in users should get a 403
      assert(response.statusCode === 302);
      request(conf.url + '/user', function(err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403
        assert(response.statusCode === 403);
        done();
      });
    });
  });
  it('login bad password', function(done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.username, password: conf.password + 'baz' },
                 }, function(err, response, body) {
      if (err) { return done(err); }
      // Successful login or creation should result in a 302 redirect
      assert(response.statusCode === 302);
      // Check if the user is logged in
      request(conf.url + '/user', function(err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403
        assert(response.statusCode === 403);
        done();
      });
    });
  });
  it('login success', function(done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.username, password: conf.password },
                 }, function(err, response, body) {
      if (err) { return done(err); }
      // Successful login or creation should result in a 302 redirect
      assert(response.statusCode === 302);
      // Check if the user is logged in
      request(conf.url + '/user', function(err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403 and no content
        assert(response.statusCode === 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, conf.username);
        done();
      });
    });
  });
});

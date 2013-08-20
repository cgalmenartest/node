var assert = require('assert');
var request = require('request').defaults({ jar: true, followRedirect: false });
var app = require('./helpers/app');
var conf = require('./helpers/config');

describe('Sails lift:', function() {
  var sailsServer;

  before(function(done) {
    sailsServer = app.spawn(function(ss, data) {
      sailsServer = ss;
      done();
    });
  });

  after(function(done) {
    app.kill(sailsServer, function() {
      done();
    });
  });

  describe('user:', function() {
    it('not logged in', function(done) {
      request(conf.url + '/user', function(err, response, body) {
        if (err) { done(err); }
        // Not logged in users should get a 403 and no content
        assert(response.statusCode === 403);
        assert.equal(body, "");
        done();
      });
    });
    it('create', function(done) {
      request.post({ url: conf.url + '/auth/local',
                     form: { username: 'foo', password: 'bar' },
                   }, function(err, response, body) {
        // Successful login or creation should result in a 302 redirect
        assert(response.statusCode === 302);
        // Should be redirected to /#projects
        assert(body.indexOf('/#projects') !== -1);
        done();
      });
    });
    it('logout', function(done) {
      request(conf.url + '/auth/logout', function(err, response, body) {
        if (err) { done(err); }
        // Not logged in users should get a 403 and no content
        assert(response.statusCode === 302);
        request(conf.url + '/user', function(err, response, body) {
          if (err) { done(err); }
          // Not logged in users should get a 403 and no content
          assert(response.statusCode === 403);
          assert.equal(body, "");
          done();
        });
      });
    });
    it('login bad password', function(done) {
      request.post({ url: conf.url + '/auth/local',
                     form: { username: 'foo', password: 'baz' },
                   }, function(err, response, body) {
        // Successful login or creation should result in a 302 redirect
        assert(response.statusCode === 302);
        // Check if the user is logged in
        request(conf.url + '/user', function(err, response, body) {
          if (err) { done(err); }
          // Not logged in users should get a 403 and no content
          assert(response.statusCode === 403);
          assert.equal(body, "");
          done();
        });
      });
    })
    it('login success', function(done) {
      request.post({ url: conf.url + '/auth/local',
                     form: { username: 'foo', password: 'bar' },
                   }, function(err, response, body) {
        // Successful login or creation should result in a 302 redirect
        assert(response.statusCode === 302);
        // Check if the user is logged in
        request(conf.url + '/user', function(err, response, body) {
          if (err) { done(err); }
          // Not logged in users should get a 403 and no content
          assert(response.statusCode === 200);
          var obj = JSON.parse(body);
          assert.equal(obj.username, "foo");
          done();
        });
      });
    })
  });
});

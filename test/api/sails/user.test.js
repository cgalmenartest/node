var assert = require('chai').assert;
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
  it('reset password', function (done) {
    request.post({ url: conf.url + '/user/resetPassword',
                   form: { password: conf.testUser.password + "aBc", json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      // Successful login or creation should result in a 200 unauthorized
      assert.equal(response.statusCode, 200);
      // check that the body is true
      var b = JSON.parse(response.body);
      assert.isTrue(b);
      conf.testUser.password += "aBc";
      // Check the new password works
      request(conf.url + '/auth/logout', function (err, response, body) {
        if (err) { return done(err); }
        request.post({ url: conf.url + '/auth/local',
                       form: { username: conf.testUser.username, password: conf.testUser.password, json: true },
                     }, function (err, response, body) {
          if (err) { return done(err); }
          // Successful login or creation should result in a 200 unauthorized
          assert.equal(response.statusCode, 200);
          // logout at end of test
          request(conf.url + '/auth/logout', function (err, response, body) {
            if (err) { return done(err); }
            done();
          });
        });
      });
    });
  });
  it('lockout user', function (done) {
    var count = 0;
    async.whilst(
      function () { return count < 7; },
      function (callback) {
        count++;
        var extra = '';
        if (count < 7) {
          extra = 'baz';
        }
        request.post({ url: conf.url + '/auth/local',
                       form: { username: conf.testUser.username, password: conf.testUser.password + extra, json: true },
                     }, function (err, response, body) {
          if (err) { return callback(err); }
          // Unsuccessful login or creation should result in a 403
          assert.equal(response.statusCode, 403);
          var b = JSON.parse(response.body);
          assert.isDefined(b.message);
          if (count == 6) {
            // still the wrong password but should be locked out
            assert.include(b.message, 'If you have an account');
          }
          if (count == 7) {
            // correct password but locked out
            assert.include(b.message, 'Your account has been locked');
          }
          callback(err);
        });
      },
      function (err) {
        done(err);
      }
    );

  });
});

var assert = require('chai').assert;
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var async = require('async');
var _ = require('underscore');
var request;

describe('user:', function() {
  before(function (done) {
    request = utils.init();
    utils.logout(request, function (err) {
      if (err) { return done(err); }
      done();
    });
  });

  it('not logged in', function(done) {
    request(conf.url + '/user', function(err, response, body) {
      if (err) { return done(err); }
      // Not logged in users should get a 403
      assert.equal(response.statusCode, 403);
      done();
    });
  });
  it('deny profile data', function(done) {
    request(conf.url + '/user/profile', function(err, response, body) {
      if (err) { return done(err); }
      // Not logged in users should get a 403
      assert.equal(response.statusCode, 403);
      done();
    });
  });
  it('deny export', function (done) {
    request.get({
      url: conf.url + '/user/export'
    }, function (err, response, body) {
      // Not logged in users should get a 403
      assert.equal(response.statusCode, 403);
      done(err);
    });
  });
  it('register', function (done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.testUser.username, password: conf.testUser.password, json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      assert.equal(response.statusCode, 403);
      request.post({ url: conf.url + '/auth/register',
                     form: { name: conf.testUser.name, username: conf.testUser.username, password: conf.testUser.password, json: true },
                   }, function (err, response, body) {
        if (err) { return done(err); }
        // Successful login or creation should be a 200 json object
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.equal(b.username, conf.testUser.username);
        assert.equal(b.name, conf.testUser.name);
        done();
      });
    });
  });
  it('create duplicate user logged in', function (done) {
    request.post({
      url: conf.url + '/auth/register',
      form: {
        name: conf.testUser.name,
        username: conf.testUser.username,
        password: conf.testUser.password,
        json: true
      }
    }, function (err, response, body) {
      if (err) { return done(err); }
      assert.equal(response.statusCode, 200);
      var email = conf.testUser.username,
          url = conf.url + '/user/emailCount?email=' + email;
      request.get(url, function(err, res, matches) {
        if (err) { return done(err); }
        assert.equal(res.statusCode, 200);
        assert.equal(matches, 1);
        done();
      });
    });
  });
  it('create duplicate user logged out', function (done) {
    request(conf.url + '/auth/logout', function (err, response, body) {
      if (err) { return done(err); }
      // it redirects for browser
      assert(response.statusCode === 302);
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403
        assert(response.statusCode === 403);
        next();
      });
    });
    function next() {
      request.post({
        url: conf.url + '/auth/register',
        form: {
          name: conf.testUser.name,
          username: conf.testUser.username,
          password: conf.testUser.password,
          json: true
        }
      }, function (err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 200);
        var email = conf.testUser.username,
            url = conf.url + '/user/emailCount?email=' + email;
        request.get(url, function(err, res, matches) {
          if (err) { return done(err); }
          assert.equal(res.statusCode, 200);
          assert.equal(matches, 1);
          done();
        });
      });
    }
  });
  it('logout', function (done) {
    request(conf.url + '/auth/logout', function (err, response, body) {
      if (err) { return done(err); }
      // it redirects for browser
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
      // Unsuccessful logins should result in a 403 NOT AUTHORIZED http error
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
  it('show profile data', function(done) {
    request(conf.url + '/user/profile', function(err, response, body) {
      if (err) { return done(err); }
      var obj = JSON.parse(body);
      // Authorized response
      assert.equal(response.statusCode, 200);
      // Has user profiles
      assert.isAbove(obj.length, 0);
      // Can only see own email address
      var emails = _(obj).chain()
            .map(function(o) { return o.username; })
            .compact()
            .value();
      assert.equal(emails.length, 1);
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, emails[0]);
        done();
      });
    });
  });
  it('change email', function(done) {
    // Check if the user is logged in
    request(conf.url + '/user', function (err, response, body) {
      if (err) { return done(err); }
      // Logged in users should get a 200 with the user object
      assert.equal(response.statusCode, 200);
      var obj = JSON.parse(body);
      var emailBefore = obj.emails[0],
          emailAfter = emailBefore.email.replace('@', '+test@');
      request.put({
        url: conf.url + '/useremail/' + emailBefore.id,
        form: { email: emailAfter },
      }, function(err, response, body) {
        if (err) { return done(err); }
        // Logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.email, emailAfter);
        done();
      });
    });
  });
  it('verify changed username', function(done) {
    // Check if the user is logged in
    request(conf.url + '/user', function (err, response, body) {
      if (err) { return done(err); }
      // Logged in users should get a 200 with the user object
      assert.equal(response.statusCode, 200);
      var obj = JSON.parse(body);
      assert.equal(obj.username, conf.testUser.username.replace('@', '+test@'));
      done();
    });
  });
  it('change back email', function(done) {
    // Check if the user is logged in
    request(conf.url + '/user', function (err, response, body) {
      if (err) { return done(err); }
      // Logged in users should get a 200 with the user object
      assert.equal(response.statusCode, 200);
      var obj = JSON.parse(body);
      var emailBefore = obj.emails[0],
          emailAfter = emailBefore.email.replace('+test@', '@');
      request.put({
        url: conf.url + '/useremail/' + emailBefore.id,
        form: { email: emailAfter },
      }, function(err, response, body) {
        if (err) { return done(err); }
        // Logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.email, emailAfter);
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
  it('read api with access_token', function(done) {
    // Tests the API with a bearer access_token,
    // reading from the profile and user endpoints
    var token = '?access_token=testCode'
    request(conf.url + '/user/profile' + token, function(err, response, body) {
      if (err) { return done(err); }
      var obj = JSON.parse(body);
      // Authorized response
      assert.equal(response.statusCode, 200);
      // Has user profiles
      assert.isAbove(obj.length, 0);
      // Can only see own email address
      var emails = _(obj).chain()
            .map(function(o) { return o.username; })
            .compact()
            .value();
      assert.equal(emails.length, 1);
      request(conf.url + '/user' + token, function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, emails[0]);
        done();
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

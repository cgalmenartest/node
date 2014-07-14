var assert = require('chai').assert;
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var request;

describe('auth:', function() {
  before(function () {
    request = utils.init();
  //   utils.login(request, function(err) {
  //     if (err) { return done(err); }
  //     done();
  //   });
  });

  it('no data', function (done) {
    request.post({ url: conf.url + '/auth/forgot',
                   form: { },
                 }, function (err, response, body) {
      assert.equal(response.statusCode, 400);
      done(err);
    });
  });
  it('no email', function (done) {
    request.post({ url: conf.url + '/auth/forgot',
                   form: { username: ' ' },
                 }, function (err, response, body) {
      assert.equal(response.statusCode, 400);
      done(err);
    });
  });
  it('invalid email', function (done) {
    request.post({ url: conf.url + '/auth/forgot',
                   form: { username: 'foobarbaz@@@slkdfjsldfkjsdlfkj' },
                 }, function (err, response, body) {
      assert.equal(response.statusCode, 400);
      done(err);
    });
  });
  it('valid email but no user account', function (done) {
    request.post({ url: conf.url + '/auth/forgot',
                   form: { username: 'midasuser@innovationgov.com' },
                 }, function (err, response, body) {
      assert.equal(response.statusCode, 200);
      var b = JSON.parse(body);
      assert.equal(b.success, true);
      assert.isUndefined(b.token);
      done(err);
    });
  });
  it('request password reset', function (done) {
    request.post({ url: conf.url + '/auth/forgot',
                   form: { username: conf.defaultUser.username },
                 }, function (err, response, body) {
      assert.equal(response.statusCode, 200);
      var b = JSON.parse(body);
      assert.equal(b.success, true);
      // check that token is included
      assert.isDefined(b.token);
      // check that it has a value
      assert(b.token);
      done(err);
    });
  });
  it('check token', function (done) {
    request.post({ url: conf.url + '/auth/forgot',
                   form: { username: conf.defaultUser.username },
                 }, function (err, response, body) {
      assert.equal(response.statusCode, 200);
      var b = JSON.parse(body);
      assert.equal(b.success, true);
      // check that token is included
      assert.isDefined(b.token);
      request.post({ url: conf.url + '/auth/checkToken',
                     form: { token: b.token },
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.ok(b);
        assert.isDefined(b.token);
        done(err);
      });
    });
  });
  it('reset password', function (done) {
    request.post({ url: conf.url + '/auth/forgot',
                   form: { username: conf.defaultUser.username },
                 }, function (err, response, body) {
      assert.equal(response.statusCode, 200);
      var b = JSON.parse(body);
      assert.equal(b.success, true);
      // check that token is included
      assert.isDefined(b.token);
      request.post({ url: conf.url + '/auth/reset',
                     form: { token: b.token, password: conf.defaultUser.password },
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.isTrue(b);
        done(err);
      });
    });
  });
  it('invalid token', function (done) {
    request.post({ url: conf.url + '/auth/checkToken',
                   form: { token: '2o3948kjdsflksjsksjdfklsjdf' },
                 }, function (err, response, body) {
      assert.equal(response.statusCode, 403);
      done(err);
    });
  });
});

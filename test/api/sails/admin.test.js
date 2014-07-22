var assert = require('chai').assert;
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var request;

describe('admin:', function () {

  describe('not admin:', function () {
    before(function (done) {
      request = utils.init();
      utils.login(request, conf.defaultUser, function (err) {
        if (err) { return done(err); }
        done();
      });
    });

    it('set admin', function (done) {
      request.get({ url: conf.url + '/admin/admin/1?action=true'
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 403);
        done(err);
      });
    });

    it('remove admin', function (done) {
      request.get({ url: conf.url + '/admin/admin/1?action=false'
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 403);
        done(err);
      });
    });

    it('get users', function (done) {
      request.get({ url: conf.url + '/admin/users'
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 403);
        done(err);
      });
    });
  });

  describe('admin:', function () {
    before(function (done) {
      request = utils.init();
      utils.login(request, conf.adminUser, function (err) {
        if (err) { return done(err); }
        done(err);
      });
    });

    it('set admin', function (done) {
      request.get({ url: conf.url + '/admin/admin/1?action=true'
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.equal(b.id, 1);
        assert.isTrue(b.isAdmin);
        done(err);
      });
    });

    it('remove admin', function (done) {
      request.get({ url: conf.url + '/admin/admin/1?action=false'
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.equal(b.id, 1);
        assert.equal(b.isAdmin, false);
        done(err);
      });
    });

    it('get users', function (done) {
      request.get({ url: conf.url + '/admin/users'
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.isDefined(b.page);
        assert.isDefined(b.count);
        assert.isDefined(b.limit);
        assert.isTrue(b.count > 0);
        done(err);
      });
    });

    it('search users', function (done) {
      request.post({ url: conf.url + '/admin/users',
                     form: { q: conf.defaultUser.username }
                   }, function (err, response, body) {
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.isDefined(b.page);
        assert.isDefined(b.count);
        assert.isDefined(b.limit);
        assert.isTrue(b.count > 0);
        assert.equal(b.users[0].username, conf.defaultUser.username);
        done(err);
      });
    });
  });
});

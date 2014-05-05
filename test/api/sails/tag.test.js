var assert = require('chai').assert;
var _ = require('underscore');
var icalendar = require('icalendar');
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var request;

describe('tag:', function() {

  var publicProject, draftProject;
  var tags = [];

  before(function(done) {
    request = utils.init();
    utils.login(request, function(err) {
      utils.createProject(request, true, function(err, proj) {
        if (err) { return done(err); }
        publicProject = proj;
        utils.createProject(request, false, function(err, proj) {
          draftProject = proj;
          done(err);
        });
      });
    });
  });

  describe('logged in:', function () {

    it('add', function (done) {
      request.post({ url: conf.url + '/tag/add',
                     body: JSON.stringify(conf.tags[0])
                   }, function (err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        // check that the values passed in are the same as those passed back
        assert.equal(conf.tags[0].name, b.name);
        assert.equal(conf.tags[0].type, b.type);
        // make sure the automatically populated fields get set
        assert(b.id);
        tags.push(b);
        done();
      });
    });

    it('create', function (done) {
      var tag = {
        projectId: publicProject.id,
        tagId: tags[0].id
      };
      request.post({ url: conf.url + '/tag',
                     body: JSON.stringify(tag)
                   }, function(err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        // check that the values passed in are the same as those passed back
        assert.equal(tag.projectId, b.projectId);
        assert.equal(tag.tagId, b.tagId);
        // make sure the automatically populated fields get set
        assert(b.id);
        done();
      });
    });

    it('findAllByProjectId', function (done) {
      request.get({ url: conf.url + '/tag/findAllByProjectId/' + publicProject.id },
        function (err, response, body) {
          if (err) { return done(err); }
          assert.equal(response.statusCode, 200);
          var b = JSON.parse(body);
          assert.equal(b.length, 1);
          b = b[0];
          assert.equal(b.tag.type, tags[0].type);
          assert.equal(b.tag.name, tags[0].name);
          assert.equal(b.tagId, tags[0].id);
          assert.equal(b.projectId, publicProject.id);
          assert(b.id);
          done();
      });
    });

    it('find denied', function (done) {
      request.get({ url: conf.url + '/tag' }, function (err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 403);
        done();
      });
    });

    it('destroy', function (done) {
      // Create a new tag
      request.post({ url: conf.url + '/tag/add',
                     body: JSON.stringify(conf.tags[1])
                   }, function (err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        // check that the values passed in are the same as those passed back
        assert.equal(conf.tags[1].name, b.name);
        assert.equal(conf.tags[1].type, b.type);
        // make sure the automatically populated fields get set
        assert(b.id);
        tags.push(b);
        var tag = {
          projectId: draftProject.id,
          tagId: b.id
        };
        // Create a mapping in the project between the tag entity
        // and the project
        request.post({ url: conf.url + '/tag',
                       body: JSON.stringify(tag)
                     }, function(err, response, body) {
          assert.equal(response.statusCode, 200);
          var b = JSON.parse(body);
          // check that the values passed in are the same as those passed back
          assert.equal(tag.projectId, b.projectId);
          assert.equal(tag.tagId, b.tagId);
          // make sure the automatically populated fields get set
          assert(b.id);
          var tagMapping = b;
          // Try to destroy the tag
          request.del({ url: conf.url + '/tag/' + tagMapping.id}, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            var b = JSON.parse(body);
            assert.equal(b.id, tagMapping.id);
            done();
          });
        });
      });
    });

  });

  describe('logged out:', function () {

    before(function () {
      request = utils.init(true);
    });

    it('add denied', function (done) {
      request.post({ url: conf.url + '/tag/add',
                     body: JSON.stringify(conf.tags[0])
                   }, function (err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 403);
        done();
      });
    });

    it('create denied', function (done) {
      var tag = {
        projectId: publicProject.id,
        tagId: tags[0].id
      };
      request.post({ url: conf.url + '/tag',
                     body: JSON.stringify(tag)
                   }, function(err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 403);
        done();
      });
    });

    it('find denied', function (done) {
      request.get({ url: conf.url + '/tag' }, function (err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 403);
        done();
      });
    });

    it('findAllByProjectId', function (done) {
      request.get({ url: conf.url + '/tag/findAllByProjectId/' + publicProject.id },
        function (err, response, body) {
          if (err) { return done(err); }
          assert.equal(response.statusCode, 200);
          var b = JSON.parse(body);
          assert.equal(b.length, 1);
          b = b[0];
          assert.equal(b.tag.type, tags[0].type);
          assert.equal(b.tag.name, tags[0].name);
          assert.equal(b.tagId, tags[0].id);
          assert.equal(b.projectId, publicProject.id);
          assert(b.id);
          done();
      });
    });

    it('findAllByProjectId denied', function (done) {
      request.get({ url: conf.url + '/tag/findAllByProjectId/' + draftProject.id },
        function (err, response, body) {
          if (err) { return done(err); }
          assert.equal(response.statusCode, 403);
          done();
      });
    });

  });

});

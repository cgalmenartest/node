var assert = require('chai').assert;
var _ = require('underscore');
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var request;

describe('project:', function() {

  var publicProject, draftProject;

  before(function(done) {
    request = utils.init();
    utils.login(request, function(err) {
      if (err) { return done(err); }
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

    before(function (done) {
      request = utils.init();
      utils.login(request, function (err) {
        done(err);
      });
    });


    it('view draft project', function (done) {
      request.get({ url: conf.url + '/project/' + draftProject.id },
                  function (err, response, body) {
        if (err) { return done(err); }
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        // check that the values returned are correct 
        assert.equal(b.title, draftProject.title);
        assert.equal(b.description, draftProject.description);
        assert.equal(b.userId, draftProject.userId);
        assert.equal(b.id, draftProject.id);
        assert.equal(b.state, "draft");
        assert.equal(b.like, false);
        done();
      });
    });

  });
/**
  describe('logged out:', function () {

    before(function () {
      request = utils.init(true);
    });

    it('view draft project', function (done) {
      request.get({ url: conf.url + '/Project/' + confirmedProject.id },
                  function(err, response, body) {
        if (err) { return done(err); }
        var b = JSON.parse(body);
        // check that the values passed in are the same as those passed back
        assert.equal(confirmedProject.title, b.title);
        assert.equal(confirmedProject.description, b.description);
        assert.equal(confirmedProject.location, b.location);
        assert.equal(confirmedProject.projectId, b.projectId);
        // make sure the automatically populated fields get set
        assert(b.id);
        assert(b.userId);
        assert(b.uuid);
        assert(b.status);
        // check if rsvp list is populated
        assert.equal(b.rsvps.length, 1);
        assert.equal(b.rsvp, false);
        done();
      });
    });

    it('view denied', function(done) {
      request.get({ url: conf.url + '/Project/' + draftProject.id },
                  function(err, response, body) {
        // access should be denied
        assert.equal(response.statusCode, 403);
        done(err);
      });
    });

  });
**/
});

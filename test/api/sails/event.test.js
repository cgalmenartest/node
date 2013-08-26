var assert = require('assert');
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var request;

describe('event:', function() {

  var publicProject, draftProject;

  var confirmedEvent, draftEvent;

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

  describe('logged in:', function() {


    var testEvent = {
      title: 'Test Event',
      description: 'Test Description',
      end: new Date(),
      location: 'San Francisco, CA',
    }

    before(function(done) {
      testEvent.start = new Date(testEvent.end);
      testEvent.start.setHours(testEvent.end.getHours() - 1);
      request = utils.init();
      utils.login(request, function(err) {
        done(err);
      });
    });

    it('create', function(done) {
      testEvent.projectId = publicProject.id;
      request.post({ url: conf.url + '/event',
                     body: JSON.stringify(testEvent)
                   }, function(err, response, body) {
        if (err) { return done(err); }
        assert(response.statusCode === 200);
        var b = JSON.parse(body);
        // check that the values passed in are the same as those passed back
        assert.equal(testEvent.title, b.title);
        assert.equal(testEvent.description, b.description);
        assert.equal(testEvent.location, b.location);
        assert.equal(testEvent.projectId, b.projectId);
        // make sure the automatically populated fields get set
        assert(b.id);
        assert(b.userId);
        assert(b.uuid);
        assert(b.status);
        confirmedEvent = b;
        done();
      });
    });

    it('create unique uuid', function(done) {
      testEvent.projectId = publicProject.id;
      request.post({ url: conf.url + '/event',
                     body: JSON.stringify(testEvent)
                   }, function(err, response, body) {
        if (err) { return done(err); }
        var p1 = JSON.parse(body);
        request.post({ url: conf.url + '/event',
                       body: JSON.stringify(testEvent)
                     }, function(err, response, body) {
          if (err) { return done(err); }
          var p2 = JSON.parse(body);
          assert.notEqual(p1.uuid, p2.uuid);
          done();
        });
      });
    });

    it('create in draft project', function(done) {
      testEvent.projectId = draftProject.id;
      request.post({ url: conf.url + '/event',
                     body: JSON.stringify(testEvent)
                   }, function(err, response, body) {
        if (err) { return done(err); }
        var b = JSON.parse(body);
        draftEvent = b;
        done();
      });
    });
  });

  describe('logged out:', function() {

    before(function() {
      request = utils.init(true);
    });

    it('view', function(done) {
      request.get({ url: conf.url + '/event/' + confirmedEvent.id },
                  function(err, response, body) {
        if (err) { return done(err); }
        var b = JSON.parse(body);
        // check that the values passed in are the same as those passed back
        assert.equal(confirmedEvent.title, b.title);
        assert.equal(confirmedEvent.description, b.description);
        assert.equal(confirmedEvent.location, b.location);
        assert.equal(confirmedEvent.projectId, b.projectId);
        // make sure the automatically populated fields get set
        assert(b.id);
        assert(b.userId);
        assert(b.uuid);
        assert(b.status);
        done();
      });
    });

    it('view denied', function(done) {
      request.get({ url: conf.url + '/event/' + draftEvent.id },
                  function(err, response, body) {
        // access should be denied
        assert.equal(response.statusCode, 403);
        done(err);
      });
    });

    it('findAllByProjectId denied', function(done) {
      request.get({ url: conf.url + '/event/findAllByProjectId/' + draftEvent.projectId },
                  function(err, response, body) {
        // access should be denied
        assert.equal(response.statusCode, 403);
        done(err);
      });
    });

  });

});

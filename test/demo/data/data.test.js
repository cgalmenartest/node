var assert = require('assert');
var _ = require('underscore');
var async = require('async');
var conf = require('./config');
var utils = require('./utils');
var request;

describe('demo:', function() {

  before(function(done) {
    request = utils.init();
    done();
  });

  it('users', function (done) {
    var process = function (user, done) {
      // create/login as user
      utils.login(request, user.username, user.password, function (err) {
        if (err) return done(err);
        // add photo
        utils.file_create(request, user.photo, function (err, fileObj) {
          // update user profile
          if (err) return done(err);
          user.photoId = fileObj.id;
          utils.user_put(request, user, function (err, userObj) {
            console.log('user created:', userObj.name);
            user.obj = userObj;
            user.id = userObj.id;
            done(err);
          });
        });
      });
    };

    async.eachSeries(_.values(conf.users), process, function (err) {
      done(err);
    })
  });

  it('projects', function (done) {
    var process = function (proj, done) {

      // sub-functions to create comments
      var createComments = function (comments, parentId, done) {
        var processComment = function (comment, done) {
          var user = conf.users[comment['user']];
          utils.login(request , user.username, user.password, function (err) {
            if (err) return done(err);
            comment.projectId = proj.id;
            if (parentId) {
              comment.parentId = parentId;
            }
            utils.comment_create(request, comment, function (err, commentObj) {
              if (err) return done(err);
              comment.obj = commentObj;
              comment.id = commentObj.id;
              if (comment.children) {
                createComments(comment.children, comment.id, function (err) {
                  done(err);
                })
              } else {
                done();
              }
            });
          });
        };
        async.eachSeries(comments, processComment, function (err) {
          done(err);
        });
      };

      var startCover = function (proj, done) {
        if (!proj.cover) return done();
        utils.file_create(request, proj.cover, function (err, fileObj) {
          if (err) return done(err);
          proj.coverId = fileObj.id;
          utils.proj_put(request, proj, function (err, projObj) {
            if (err) return done(err);
            proj.obj = projObj;
            done(err);
          });
        });
      };

      var startComments = function (proj, done) {
        if (!proj.comments) return done();
        createComments(proj.comments, null, done);
      };

      var startOwners = function (proj, done) {
        var createOwner = function (owner, done) {
          var pOwner = {
            projectId: proj.id,
            userId: conf.users[owner].id
          };
          utils.projowner_create(request, pOwner, function (err, ownerObj) {
            owner.obj = ownerObj;
            owner.id = ownerObj.id;
            done(err);
          });
        };
        if (!proj.owners) return done();
        async.each(proj.owners, createOwner, done);
      };

      var startEvents = function (proj, done) {
        var now = new Date();
        var createEvent = function (ev, done) {
          ev.projectId = proj.id;
          ev.start = new Date(now.valueOf());
          ev.start.setDate(now.getDate() + Math.ceil(Math.random()*30));
          ev.start.setMinutes(0);
          ev.start.setSeconds(0);
          ev.start.setMilliseconds(0);
          ev.end = new Date(ev.start.getTime());
          ev.end.setHours(ev.start.getHours() + 1);
          ev.start = ev.start.toISOString();
          ev.end = ev.end.toISOString();
          console.log(ev);
          utils.event_create(request, ev, function (err, eventObj) {
            ev.obj = eventObj;
            ev.id = eventObj.id;
            done(err);
          });
        };
        async.each(proj.events, createEvent, done);
      }

      var start = function (fn, done) {
        fn(proj, done);
      };

      var order = [startCover, startOwners, startComments, startEvents];

      // start processing each project
      var user = conf.users[proj.owner];
      utils.login(request, user.username, user.password, function (err) {
        if (err) return done(err);
        utils.proj_create(request, proj, function (err, projObj) {
          proj.obj = projObj;
          proj.id = projObj.id;
          // Process each of the sub functions
          async.eachSeries(order, start, function (err) {
            done(err);
          });
        });
      });
    };

    async.eachSeries(conf.projects, process, function (err) {
      done(err);
    });
  });

});

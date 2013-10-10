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
      }

      // start processing each project
      var user = conf.users[proj.owner];
      utils.login(request, user.username, user.password, function (err) {
        if (err) return done(err);
        utils.proj_create(request, proj, function (err, projObj) {
          proj.obj = projObj;
          proj.id = projObj.id;
          startCover(proj, function (err) {
            if (err) return done(err);
            startComments(proj, function (err) {
              done(err);
            });
          });
        });
      });
    };

    async.eachSeries(conf.projects, process, function (err) {
      done(err);
    });
  });

});

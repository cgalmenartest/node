var assert = require('assert');
var _ = require('underscore');
var async = require('async');
var conf = require('./config');
var utils = require('./utils');
var request;

describe('users:', function() {

  before(function(done) {
    request = utils.init();
    done();
  });

  it('create', function (done) {
    var process = function (user, done) {
      // create/login as user
      utils.login(request, user.username, user.password, function (err) {
        if (err) return done(err);
        // add photo
        utils.file_create(request, user.photo, function (err, fileObj) {
          // update user profile
          if (err) return done(err);
          user.photoId = fileObj.id;
          // var userSubmit = {
          //   name: user.name,
          //   username: user.username,
          //   photoId: user.photoId
          // }
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

});

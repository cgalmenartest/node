/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Get and update information about currently logged in user.
 */
var async = require('async');
var _ = require('underscore');
var projUtils = require('../services/utils/project');
var tagUtils = require('../services/utils/tag');
var userUtils = require('../services/utils/user');
var validator = require('validator');

var update = function (req, res) {
  var user = req.user[0];
  var params = _.extend(req.body || {}, req.params);
  if (!_.isUndefined(params.name)) { user.name = params.name; }
  if (!_.isUndefined(params.username)) { user.username = params.username; }
  if (!_.isUndefined(params.photoId)) { user.photoId = params.photoId; }
  if (!_.isUndefined(params.photoUrl)) { user.photoUrl = params.photoUrl; }
  if (!_.isUndefined(params.title)) { user.title = params.title; }
  if (!_.isUndefined(params.bio)) { user.bio = params.bio; }
  // The main user object is being updated
  if (user) {
    sails.log.debug('User Update:', user);
    user.save(function (err) {
      if (err) { return res.send(400, {message:'Error while saving user.'}) }
      // Check if a userauth was removed
      if (params.auths) {
        var checkAuth = function(auth, done) {
          if (_.contains(params.auths, auth.provider)) {
            return done();
          }
          auth.destroy(done);
        };

        UserAuth.findByUserId(req.user[0].id, function (err, auths) {
          if (err) { return res.send(400, {message:'Error finding authorizations.'}); }
          async.each(auths, checkAuth, function(err) {
            if (err) { return res.send(400, {message:'Error finding authorizations.'}); }
            user.auths = params.auths;
            return res.send(user);
          });
        });
      } else {
        res.send(user);
      }
    });
  }
};

module.exports = {

  /**
   * Check if a given username already exists
   *
   * @params :id of the username to test, eg:
   *         user/username/:id such as user/username/foo
   * @return true if the username is taken (can't be used),
   *         false if the username is available
   */
  username: function (req, res) {
    // don't allow empty usernames
    if (!req.route.params.id) {
      return res.send(true);
    }
    // only allow email usernames, so check if the email is valid
    if (validator.isEmail(req.route.params.id) !== true) {
      return res.send(true);
    }
    // check if a user already has this email
    userUtils.findUser(req.route.params.id, function (err, user) {
      if (err) { return res.send(400, { message:'Error looking up username.' }); }
      if (!user) { return res.send(false); }
      if (req.user && req.user[0].id == user.id) { return res.send(false); }
      return res.send(true);
    });
  },

  info: function (req, res) {
    var reqId = null;
    if (req.user) {
      reqId = req.user[0].id;
    }
    sails.services.utils.user['getUser'](req.route.params.id, reqId, function (err, user) {
      // prune out any info you don't want to be public here.
      if (err) { return res.send(400, { message: err }); }
      sails.log.debug('User Get:', user);
      res.send(user);
    });
  },

  find: function(req, res) {
    // If the user is not logged in, return null object
    if (!req.user) {
      return res.send(403, null);
    }
    var reqId = req.user[0].id;
    var userId = req.user[0].id;
    if (req.route.params.id) {
      userId = req.route.params.id;
    }
    sails.services.utils.user['getUser'](userId, reqId, function (err, user) {
      // this will only be shown to logged in users.
      if (err) { return res.send(400, { message: err }); }
      sails.log.debug('User Get:', user);
      res.send(user);
    });
  },

  update: function (req, res) {
    return update(req, res);
  },

  activities: function (req, res) {
    var reqId = null;
    var userId = (req.user ? req.user[0].id : null);
    if (req.user) {
      reqId = req.user[0].id;
    }
    if (req.route.params.id) {
      reqId = req.route.params.id;
    }
    var projects = [];
    // Get projects owned by this user
    ProjectOwner.find()
    .where({ userId: reqId })
    .exec(function (err, ownerList) {
      var projIds = [];
      // Get each project that the current user is authorized to see
      var getProject = function(projId, done) {
        projUtils.authorized(projId, userId, function (err, proj) {
          if (proj) {
            // delete unnecessary data from projects
            delete proj['deletedAt'];
            projects.push(proj);
          }
          done(err);
        });
      };
      for (var i in ownerList) {
        projIds.push(ownerList[i].projectId);
      }

      // Grab each of the projects
      async.each(projIds, getProject, function (err) {
        if (err) { return res.send(400, { message: 'Error looking up projects.'}); }
        // Then grab the project metadata
        var getMetadata = function(proj, done) {
          projUtils.getMetadata(proj, userId, function (err, newProj) {
            if (!err) {
              proj = newProj;
            }
            return done(err);
          });
        };
        async.each(projects, getMetadata, function (err) {
          if (err) { return res.send(400, { message: 'Error looking up projects.'}); }
          // find tasks that user owns
          Task.find()
          .where({ userId: reqId })
          .exec(function (err, tasks) {
            if (err) { return res.send(400, { message: 'Error looking up tasks.'}); }
            return res.send({
              projects: projects,
              tasks: tasks
            });
          });
        })
      });

    });
  },

  photo: function(req, res) {
    User.findOneById(req.route.params.id, function (err, user) {
      if (err || !user) { return res.redirect('/images/default-user-icon-profile.png'); }
      if (user.photoId) {
        return res.redirect(307, '/api/file/get/' + user.photoId);
      } else if (user.photoUrl) {
        return res.redirect(307, user.photoUrl);
      } else {
        return res.redirect(307, '/images/default-user-icon-profile.png');
      }
    });
  },

  // Enable a disabled user
  enable: function (req, res) {
    // policies will ensure only admins can run this function
    User.findOneById(req.route.params.id, function (err, user) {
      if (err) { return res.send(400, { message: 'An error occurred looking up this user.', error: err }); }
      user.disabled = false;
      user.save(function (err) {
        if (err) { return res.send(400, { message: 'An error occurred enabling this user.', error: err }); }
        return res.send(user);
      });
    });
  },

  // Disable a user so that they cannot log in
  disable: function (req, res) {
    // check that we're permitted to disable this user
    if ((req.user[0].id == req.route.params.id) || (req.user[0].isAdmin)) {
      if (req.user[0].id == req.route.params.id) {
        req.user[0].disabled = true;
        req.user[0].save(function (err) {
          if (err) { return res.send(400, { message: 'An error occurred disabling this user.', error: err }); }
          return res.send(req.user[0]);
        });
      } else {
        User.findOneById(req.route.params.id, function (err, user) {
          if (err) { return res.send(400, { message: 'An error occurred looking up this user.', error: err }); }
          user.disabled = true;
          user.save(function (err) {
            if (err) { return res.send(400, { message: 'An error occurred disabling this user.', error: err }); }
            return res.send(user);
          });
        });
      }
    }
    else {
      res.send(403, { message: 'Not authorized.' });
    }
  }

};

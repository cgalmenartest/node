/**
 * Source definition for
 *
 * @module    :: audience.js
 * @description :: defines service function that returns the volunteer supervisor email
 */
//var $ = require('jquery');
var _ = require('underscore');
var utils = require('./utils');
var fs    = require('fs');
//var UIConfig = require('/assets/js/backbone/config/ui.json');

module.exports = {
  execute: function (fields, email, cb) {
  //placeholder while rest is worked out

  var UIConfig = JSON.parse(fs.readFileSync('assets/js/backbone/config/ui.json', 'utf8'));
  if ( UIConfig.supervisorEmail.useSupervisorEmail ) {
    var supervisor = [
    {
      username: 'XXXXXXXXXX@example.com',
      name: 'Supervisor Proxy',
      title: 'Supervisor',
      bio: null,
      photoId: null,
      photoUrl: null,
      isAdmin: false,
      disabled: true,
      passwordAttempts: 0,
      id: 0,
      createdAt: 'Mon Sep 22 2014 15:56:17 GMT-0400 (EDT)',
      updatedAt: 'Mon Sep 22 2014 15:56:23 GMT-0400 (EDT)'
    }];
      return cb(null,supervisor);
    } else {
      return cb(null,[{}]);
    }
  }
};

/**
 * This is the main application bootstrap
 * that gets the rest of the apps, routers, etc
 * running.
 */

// Install jQuery plugins
require('../vendor/jquery-file-upload/js/vendor/jquery.ui.widget');
moment = require('moment');

// App
window.Application      = window.Application || {};
window.cache            = { userEvents: {}, currentUser: null, system: {} };

// Events
window.entities = { request: {} };
rendering       = {}

// Set up Backbone to use jQuery
_ = require('underscore');
Backbone = require('backbone');
Backbone.$ = jQuery;

// Load the application
var appr = require('./app-run');
appr.initialize();

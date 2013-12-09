/**
 * This is the main application bootstrap
 * that gets the rest of the apps, routers, etc
 * running.
 */
require(['app-run'], function (appr) {
  appr.initialize();
});

// App
window.Application      = window.Application || {};
window.cache            = { userEvents: {}, currentUser: null };

Application.AppModule   = {};
Application.Controller  = {};
Application.Component   = {};

// Events
window.entities = { request: {} };
rendering       = {}

define([
  'jquery',
  'underscore',
  'backbone',
  'nav_app',
  'browse_app',
  'task_app'
], function ($, _, Backbone, NavApp, BrowseApp, TaskApp) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      ''              : 'initializeApp',
    },

    initializeApp: function () {
      Backbone.history.navigate('/projects', { trigger: true });
    }
  });

  var initialize = function () {
    var router, nav, browse, task;

    // Here we are going to fire up all the routers for our app to listen
    // in on their respective applications.  We are -testing- this functionality
    // by using the profile application as a starting point (very simple, 1 route).
    router  = new AppRouter();    
    nav = NavApp.initialize();
    browse = BrowseApp.initialize();
    task = TaskApp.initialize();

    Backbone.history.start({ pushState: true });

  } 

  return {
    initialize: initialize
  };
});
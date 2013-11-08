define([
  'jquery',
  'underscore',
  'backbone',
  'nav_app',
  'project_app',
  'task_app',
  'profile_app'
], function ($, _, Backbone, NavApp, ProjectApp, TaskApp, ProfileApp) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      ''              : 'initializeApp',
    },

    initializeApp: function () {
      Backbone.history.navigate('/projects', { trigger: true });
    }
  });

  var initialize = function () {
    var router, nav, profile, task, project;

    // Here we are going to fire up all the routers for our app to listen
    // in on their respective applications.  We are -testing- this functionality
    // by using the profile application as a starting point (very simple, 1 route).
    router  = new AppRouter();    
    nav = NavApp.initialize();
    profile = ProfileApp.initialize();
    project = ProjectApp.initialize();
    task = TaskApp.initialize();

    Backbone.history.start({ pushState: true });

  } 

  return {
    initialize: initialize
  };
});
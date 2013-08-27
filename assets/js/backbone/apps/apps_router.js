define([
  'jquery',
  'underscore',
  'backbone',
  'marketing_app',
  'projects_app',
  'profile_app'
], function ($, _, Backbone, MarketingApp, ProjectApp, ProfileApp) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      'home'          : 'initializeMarketingApp',
      'projects'      : 'initializeProjectsApp'
    },

    initializeMarketingApp: function () {
      this.homeApp ? this.homeApp.initialize() : this.homeApp = new MarketingApp();
    },

    initializeProjectsApp: function () {
      this.projectsApp ? this.projectsApp.initialize() : this.projectsApp = new ProjectApp();
    }
  });

  var initialize = function () {

    // Here we are going to fire up all the routers for our app to listen
    // in on their respective applications.  We are -testing- this functionality
    // by using the profile application as a starting point (very simple, 1 route).
    var router  = new AppRouter();    
    var profile = ProfileApp.initialize();

    Backbone.history.start({pushState: false});

    $(".nav li").on("click", function () {
      $(".nav li").removeClass("active");
      $(this).addClass("active");
    });
  } 

  return {
    initialize: initialize
  };
});
define([
  'jquery',
  'underscore',
  'backbone',
  'marketing_app',
  'project_app',
  'profile_app'
], function ($, _, Backbone, MarketingApp, ProjectApp, ProfileApp) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      'home'          : 'initializeMarketingApp'
    },

    initializeMarketingApp: function () {
      if (this.homeApp)
        this.homeApp.cleanup();
      
      this.homeApp = new MarketingApp({
        el: "#container"
      });
    }
  });

  var initialize = function () {
    var router, profile, project;

    // Here we are going to fire up all the routers for our app to listen
    // in on their respective applications.  We are -testing- this functionality
    // by using the profile application as a starting point (very simple, 1 route).
    router  = new AppRouter();    
    profile = ProfileApp.initialize();
    project = ProjectApp.initialize();

    Backbone.history.start({ pushState: false });

    $(".nav li").on("click", function () {
      $(".nav li").removeClass("active");
      $(this).addClass("active");
    });
  } 

  return {
    initialize: initialize
  };
});
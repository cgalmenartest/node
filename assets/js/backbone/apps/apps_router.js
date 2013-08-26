define([
  'jquery',
  'underscore',
  'backbone',
  'marketing_app',
  'projects_app',
  'user_app'
], function ($, _, Backbone, MarketingApp, ProjectApp, UserApp) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      'home'          : 'initializeMarketingApp',
      'projects'      : 'initializeProjectsApp',
      'user'          : 'initializeUserApp'
    },

    initializeMarketingApp: function () {
      this.homeApp ? this.homeApp.initialize() : this.homeApp = new MarketingApp();
    },

    initializeProjectsApp: function () {
      this.projectsApp ? this.projectsApp.initialize() : this.projectsApp = new ProjectApp();
    },

    initializeUserApp: function () {
      this.userApp ? this.userApp.initialize() : this.userApp = new UserApp();
    }
  });

  var initialize = function () {
    var router = new AppRouter();
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
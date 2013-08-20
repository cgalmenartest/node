define([
  'jquery',
  'underscore',
  'backbone',
  'marketing_app',
  'projects_app'
], function ($, _, Backbone, MarketingApp, ProjectApp) {

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
    var router = new AppRouter();
    Backbone.history.start();

    $(".nav li").on("click", function () {
      $(".nav li").removeClass("active");
      $(this).addClass("active");
    });
  } 

  return {
    initialize: initialize
  };
});
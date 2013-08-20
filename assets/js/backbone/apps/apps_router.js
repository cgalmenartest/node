define([
  'jquery',
  'underscore',
  'backbone',
  'projects_app'
], function ($, _, Backbone, ProjectApp) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      'projects': 'initializeProjectsApp'
    },

    initializeProjectsApp: function () {
      if (this.projectsApp) {
        this.projectsApp.initialize();
      } else {
        this.projectsApp = new ProjectApp();
      }
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
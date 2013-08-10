define([
  'jquery',
  'underscore',
  'backbone',
  'views/marketing/home',
  'collections/projects',
  'collections/tasks',
  'views/tasks/list',
  'views/profile/show'
], function ($, _, Backbone, HomeView, ProjectsCollection, TasksCollection, TaskListView, ProfileView) {
  'use strict';
  
  var AppRouter = Backbone.Router.extend({

    routes: {
      // Expects #home, etc .....
      '/'             : 'home',
      'home'          : 'home',
      'user'          : 'profile',
      'projects'      : 'listProjects',
      '*actions'      : 'defaultAction'
    },

    home: function () {
      console.log("Initializing home view");
      new HomeView();
    },

    profile: function () {
      var profile = new ProfileView();
    },

    listProjects: function () {
      if (!this.collection) {
          this.collection = new ProjectsCollection();
      }
      this.collection.fetch();
    }
  });

  var initialize = function () {
    var router = new AppRouter();
    Backbone.history.start();

    router.on('defaultAction', function (actions) {
      console.log("no route:", actions);
    });

    $(".nav li").on("click", function () {
      $(".nav li").removeClass("active");
      $(this).addClass("active");
    })
  }

  return {
    initialize: initialize
  }
});
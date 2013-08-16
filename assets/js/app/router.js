define([
  'jquery',
  'underscore',
  'backbone',
  'views/marketing/home',
  'views/projects/list',
  'collections/tasks',
  'views/tasks/list',
  'models/profile'
], function ($, _, Backbone, HomeView, ProjectListView, TasksCollection, TaskListView, ProfileModel) {
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
      // HomeView is a no-op, so it doesn't matter
      // For now if being re-initialized.  Will fix this
      // When we use the router extension manager.
      new HomeView(); 
    },

    profile: function () {
      this.profile = new ProfileModel();
      this.profile.trigger("profile:fetch");
    },

    listProjects: function () {
      if (this.projectList) {
        this.projectList.initialize();
      } else {
        this.projectList = new ProjectListView();
      }
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
    });

  }

  return {
    initialize: initialize
  }
});
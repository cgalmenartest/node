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
      console.log("Initializing home view");
      if (this.homeView) this.homeView.remove();
      console.log(this.homeView);

      new HomeView(); 
    },

    profile: function () {
      this.profile = new ProfileModel();
      this.profile.trigger("profile:fetch");
    },

    listProjects: function () {
      if (this.projectList) {
        console.log("PROJECT LIST VIEW ALREADY EXISTS");
        this.projectList.initialize();
      } else {
        console.log("NEW PROJECT LIST VIEW");
        this.projectList = new ProjectListView();
        // console.log(this.projectList.models.length);
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

    // window.location.hash === "" ? new AppRouter({routes: { '': 'home' }}) : '';
  }

  return {
    initialize: initialize
  }
});
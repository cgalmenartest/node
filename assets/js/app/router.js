define([
  'jquery',
  'underscore',
  'backbone',
  'views/marketing/home',
  'collections/projects',
  'collections/tasks',
  'views/tasks/list'
], function ($, _, Backbone, HomeView, ProjectsCollection, TasksCollection, TaskListView) {
  'use strict';
  
  var AppRouter = Backbone.Router.extend({

    routes: {
      // Expects #home, etc .....
      'home'          : 'home',
      'projects'      : 'listProjects',
      '*actions'      : 'defaultAction'
    },

    home: function () {
      console.log("Initializing home view");
      new HomeView();
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
  }

  return {
    initialize: initialize
  }
});
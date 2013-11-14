define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'browse_list_controller',
  'project_model',
  'project_show_controller',
  'profile_show_controller'
], function ($, _, Backbone, utils, BrowseListController, ProjectModel, ProjectShowController, ProfileShowController) {

  var BrowseRouter = Backbone.Router.extend({

    routes: {
      'projects(/)'               : 'listProjects',
      'projects/:id(/)'           : 'showProject',
      'tasks(/)'                  : 'listTasks',
      'profile(/)'                : 'showProfile',
      'profile/:id(/)'            : 'showProfile'
    },

    data: { saved: false },

    cleanupChildren: function() {
      if (this.browseListController) { this.browseListController.cleanup(); }
      if (this.projectShowController) { this.projectShowController.cleanup(); }
      if (this.profileShowController) { this.profileShowController.cleanup(); }
      this.data = { saved: false };
    },

    listProjects: function () {
      this.cleanupChildren();
      this.browseListController = new BrowseListController({
        target: 'projects',
        data: this.data
      });
    },

    listTasks: function () {
      this.cleanupChildren();
      this.browseListController = new BrowseListController({
        target: 'tasks',
        data: this.data
      });
    },

    showProject: function (id) {
      this.cleanupChildren();
      var model = new ProjectModel();
      model.set({ id: id });
      this.projectShowController = new ProjectShowController({ model: model, router: this });
    },

    showProfile: function (id) {
      this.cleanupChildren();
      this.profileShowController = new ProfileShowController({ id: id, data: this.data });
    }

  });

  var initialize = function () {
    var router = new BrowseRouter();
    return router;
  }

  return {
    initialize: initialize
  };
});

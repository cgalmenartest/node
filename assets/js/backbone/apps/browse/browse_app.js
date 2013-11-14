define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'browse_list_controller',
  'project_model',
  'project_show_controller',
  'task_item_view',
  'task_model'
], function ($, _, Backbone, utils, BrowseListController, ProjectModel, ProjectShowController, TaskItemView, TaskModel) {

  var BrowseRouter = Backbone.Router.extend({

    routes: {
      'projects(/)'               : 'listProjects',
      'projects/:id(/)'           : 'showProject',
      'tasks(/)'                  : 'listTasks'
    },

    data: { saved: false },

    listProjects: function () {
      if (this.browseListController) {
        this.browseListController.cleanup();
      }
      this.browseListController = new BrowseListController({
        target: 'projects',
        data: this.data
      });
    },

    listTasks: function () {
      if (this.browseListController) {
        this.browseListController.cleanup();
      }
      this.browseListController = new BrowseListController({
        target: 'tasks',
        data: this.data
      });
    },

    showProject: function (id) {
      clearContainer();

      var model = new ProjectModel();
      model.set({ id: id });

      if (this.projectShowController) this.projectShowController.cleanup();
      this.projectShowController = new ProjectShowController({ model: model, router: this });

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

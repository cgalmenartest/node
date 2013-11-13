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
      'projects/:id(/)'           : 'show',
    },

    data: { saved: false },

    listProjects: function () {
      if (this.browseListController) {
        this.browseListController.cleanup();
      } else {
        this.browseListController = new BrowseListController({
          target: 'projects'
        });
      }
    },

    show: function (id) {
      clearContainer();

      var model = new ProjectModel();
      model.set({ id: id });

      if (this.projectShowController) this.projectShowController.cleanup();
      this.projectShowController = new ProjectShowController({ model: model, router: this });

    },

    showTask: function (noop, taskId) {
      clearContainer();
      scrollTop();

      var self = this,
          model = new TaskModel();

      model.fetch({
        url: '/api/task/' + taskId,
        success: function (taskModel) {

          $.ajax({
            url: '/api/tag/findAllByTaskId/' + taskId,
            async: false,
            success: function (data) {
              taskModel.attributes['tags'] = data;
            }
          });

          if (self.taskItemView) self.taskItemView.cleanup();
          self.taskItemView = new TaskItemView({ model: taskModel, router: self });
        }
      });
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

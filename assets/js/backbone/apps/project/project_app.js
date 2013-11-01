define([
  'jquery',
  'underscore',
  'backbone',
  'project_model',
  'project_list_controller',
  'project_show_controller',
  'utilities',
  'task_item_view',
  'task_model'
], function ($, _, Backbone, ProjectModel, ProjectListController, ProjectShowController, utilities, TaskItemView, TaskModel) {

  var ProjectRouter = Backbone.Router.extend({

    routes: {
      'projects(/)'               : 'list',
      'projects/:id(/)'           : 'show',
      'projects/:id/tasks/:id(/)' : 'showTask'
    },

    list: function () {
      $("#container").children().remove();
      if (this.projectListController) {
        this.projectListController.initialize({ router: this });
      } else {
        this.projectListController = new ProjectListController({ router: this });
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
    var router = new ProjectRouter();
  }

  return {
    initialize: initialize
  };
});

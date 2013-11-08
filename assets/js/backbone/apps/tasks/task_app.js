define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'task_item_view',
  'task_model'
], function ($, _, Backbone, utilities, TaskItemView, TaskModel) {

  var TaskRouter = Backbone.Router.extend({

    routes: {
      'tasks/:id(/)'              : 'show',
    },

    show: function (id) {
      // clearContainer();
      // scrollTop();

      var self = this,
          model = new TaskModel();

      if (self.taskItemView) self.taskItemView.cleanup();
      self.taskItemView = new TaskItemView({ model: model, router: self, id: id });
    }

  });

  var initialize = function () {
    var router = new TaskRouter();
    return router;
  }

  return {
    initialize: initialize
  };
});

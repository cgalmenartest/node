// Here I  will attempt to keep all the logic for tags in the controller
// and not in the view layer.  If this works then we can move
// the project view tag methods out to the controller as it should be.

define([
  'bootstrap',
  'underscore',
  'backbone',
  'comment_list_controller',
  'task_item_view'
], function (Bootstrap, _, Backbone, CommentListController, TaskItemView) {

  var TaskShowController = Backbone.View.extend({

    el: "#container",

    initialize: function () {
      this.initializeTaskItemView();
      this.initializeChildren();
    },

    initializeChildren: function () {
      if (this.commentListController) this.commentListController.cleanup();
      this.commentListController = new CommentListController({
        task: true,
        taskId: this.model.id
      });
    },

    initializeTaskItemView: function () {
      var self = this;

      if (this.taskItemView) this.taskItemView.cleanup();
      this.taskItemView = new TaskItemView({
        model: self.model,
        router: self.router
      })
    },

    cleanup: function () {
      this.commentListController.cleanup();
      this.$el.children().remove();
    }

  });

  return TaskShowController;
})
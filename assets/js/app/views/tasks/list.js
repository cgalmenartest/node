define([
  'jquery',
  'underscore',
  'backbone',
  'models/task',
  '../../../../../js/app/views/tasks/form',
  'text!../../../../../templates/tasks/list.html'
], function ($, _, Backbone, TaskModel, TaskFormView, TaskListTemplate) {
  'use strict';

  var TaskListView = Backbone.View.extend({
      
    el: ".task-list-wrapper",

    initialize: function (data) {
      this.isRendered = false;
      this.render(data);
    },

    render: function (data) {
      if (this.isRendered) return;
      this.isRendered = true;

      var template = _.template(TaskListTemplate, data);
      this.$el.html(template).hide().fadeIn();
      if (!TaskFormView) new TaskFormView().render()
      return this;
    }
  });

  return TaskListView;
})
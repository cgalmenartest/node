define([
  'jquery',
  'underscore',
  'backbone',
  'models/task',
  '../../../../../js/app/views/tasks/form',
  'text!../../../../../templates/tasks/list.html',
], function ($, _, Backbone, TaskModel, TaskFormView, TaskListTemplate) {
  'use strict';

  var TaskListView = Backbone.View.extend({
      
    el: $("#container"),

    initialize: function (data) {
      this.render(data);

    },

    render: function (data) {
      var template = _.template(TaskListTemplate, data);
      this.$el.append(template).hide().fadeIn();
      new TaskFormView().render();
      return this;
    }
  });

  return TaskListView;
})
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
      new TaskFormView().render()
      
      app.events.on("task:render", function () {
        // Hard wipe out the modal upon the rendering of a task (success)
        $(".modal a[href='#addTask']").modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        var heightOfSingleTask  = 90,
            taskCount           = $("#task-list-wrapper").children().find('li').length,
            scrollLength        = taskCount * heightOfSingleTask;

        // Set at a 5ms timeout before the scroll for user experience purposes
        setTimeout(function () {
          $("#task-list-wrapper").animate({ scrollTop: scrollLength });
        }, 500);
      });

      // return this;

    }

  });

  return TaskListView;
})
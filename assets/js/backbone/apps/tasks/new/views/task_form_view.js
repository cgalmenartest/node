define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'tasks_collection',
    'text!task_form_template'
], function ($, Bootstrap, _, Backbone, TasksCollection, TaskFormTemplate) {
	'use strict';

	var TaskFormView = Backbone.View.extend({

		el: "#task-list-wrapper",
		
		template: _.template(TaskFormTemplate),

		events: {
			"submit #task-form" : "post"
		},

		initialize: function () {
			this.options = _.extend(this.options, this.defaults);

			if (this.tasks) {
        this.tasks.destroy();
      }
      this.tasks = new TasksCollection();	

      this.initializePostTaskSaveEventListeners();
		},
		
		render: function () {
			this.$el.html(this.template)
		},

    post: function (e) {
      if (e.preventDefault()) e.preventDefault();

      var title, description, projectId;

      title       = $("#task-title").val();
      projectId   = this.options.projectId;
      description = $("#task-description").val();

      this.tasks.trigger("task:save", title, projectId, description);
    },

    initializePostTaskSaveEventListeners: function () {

      this.listenTo(this.tasks, "tasks:render", function () {

        // Hard wipe out the modal upon the rendering of a task (success)
        $(".modal a[href='#addTask']").modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        var heightOfSingleTask  = 90,
            taskCount           = $("#task-list").children().find('li').length,
            scrollLength        = taskCount * heightOfSingleTask;

        // Set at a 5ms timeout before the scroll for user experience purposes
        setTimeout(function () {
          $("#task-list").animate({ scrollTop: scrollLength });
        }, 500);
      });

    }

	});

	return TaskFormView;

});
define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'tasks_collection',
    'text!task_form_template',
], function ($, Bootstrap, _, Backbone, TasksCollection, TaskFormTemplate) {

	var TaskFormView = Backbone.View.extend({

		el: "#task-list-wrapper",

		template: _.template(TaskFormTemplate),

		events: {
      "submit #task-form"     : "post"
		},

		initialize: function () {
			this.options = _.extend(this.options, this.defaults);
      this.tasks = this.options.tasks;
		},

		render: function () {
			this.$el.html(this.template)
      // On rendering event make sure to hide all sections
      // that are not the current section.
      $("section:not(.current)").hide();
		},

    post: function (e) {
      if (e.preventDefault()) e.preventDefault();

      var taskData = {
        title                   = $("#task-title").val(),
        projectId               = this.options.projectId,
        description             = $("#task-description").val()
      }

      var tagData = {
        topics                  = $("#task-topics").val(),
        skills                  = $("#task-skills").val(),
        teamSize                = $("#task-team-size").val(),
        typeOfTimeRequired      = $("#task-type-of-time-required").val(),
        classNetAccessRequired  = $("#task-classnet-access").val()
      }

      this.tasks.trigger("task:save", taskData);

      // Save taskData and tagData seperately, as they relate, but perhaps
      // do so in Collection.
      //
      // If we do so in collection we can save the the tags with the taskId.
      // as that is when we are initializing the new model for tasks.
      // $.ajax({
      //   url: '/api/tag/add',
      //   type: 'POST',
      //   data: tagData,
      //   success: function (result) {
      //     this.tasks.model.trigger("task:tag:new", result);
      //   }
      // })

    },

    cleanup: function () {
      removeView(this);
    }

	});

	return TaskFormView;

});

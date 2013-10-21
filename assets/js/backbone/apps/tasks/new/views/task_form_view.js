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
      "click .progress"    : "moveWizardForward",
			"submit #task-form" : "post"
		},

		initialize: function () {
			this.options = _.extend(this.options, this.defaults);
      this.tasks = this.options.tasks;
		},

		render: function () {
			this.$el.html(this.template)
      $("section:not(.current)").hide();
		},

    // This method is contains a re-usable way to move forward
    // over and over regardless of location based on the idea of setting and
    // removing current to next in an adjacent manner.
    moveWizardForward: function (e) {
      if (e.preventDefault()) e.preventDefault();
      var next    = $(".current").next();
          current = $(".current");

      if (!_.isUndefined(next.html())) {
        current.children().hide();
        current.removeClass("current");
        next.addClass("current");
        next.show();
      } else {
        return;
      }
    },

    post: function (e) {
      if (e.preventDefault()) e.preventDefault();

      var title, description, projectId;

      title       = $("#task-title").val();
      projectId   = this.options.projectId;
      description = $("#task-description").val();

      this.tasks.trigger("task:save", title, projectId, description);
    },

	});

	return TaskFormView;

});

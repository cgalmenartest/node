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
      "submit #task-form"     : "post",
      "click .wizard-forward" : "moveWizardForward",
      "click .wizard-back"    : "moveWizardBack",
      "click .add-topic"      : "addTopic"
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

    addTopic: function (e) {
      if (e.preventDefault()) e.preventDefault();
      var topicForm     = $("#single-topic-form"),
          newTopicForm  = topicForm.html(),
          topicWrapper  = $(".work-topics");

      topicWrapper.append(newTopicForm);
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

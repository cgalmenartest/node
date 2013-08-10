define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'models/task',
    'text!../../../../../templates/tasks/form.html'
], function ($, Bootstrap, _, Backbone, TaskModel, TaskFormTemplate) {

	var TaskFormView = Backbone.View.extend({

		el: "#task-form-wrapper",

		events: {
			'submit #task-form': 'post'
		},

		initialize: function () {
			this.delegateEvents();
		},

		render: function () {
			data = {};

			compiledTemplate = _.template(TaskFormTemplate, data)
			this.$el.html(compiledTemplate)
		},

    post: function (e) {
        var title, description, projectId;

        if (e.preventDefault()) e.preventDefault();

        this.model = new TaskModel();

        title       = $("#task-title").val();
        projectId   = parseInt($(".project-id").text());
        description = $("#task-description").val()

        this.model.trigger("task:save", title, projectId, description);
    }

	});

	return TaskFormView;

});
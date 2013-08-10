define([
	'jquery',
	'underscore',
	'backbone',
	'text!../../../../templates/projects/form.html'
], function ($, _, Backbone, ProjectFormTemplate) {

	var ProjectFormView = Backbone.View.extend({

		el: "#project-form-wrapper",

		events: {
			"submit #project-form": "post"
		},

		initialize: function () {
			this.render();
		},

		render: function () {
			data = {};
			var compiledTemplate = _.template(ProjectFormTemplate, data)
			this.$el.html(compiledTemplate);
		},

		post: function (e) {
			e.preventDefault();

      var title, description;

      title       = $(".project-name").val();
      description = $(".project-description").val();
  
      this.model.trigger("project:post", title, description);
		}

	});

	return ProjectFormView;
});
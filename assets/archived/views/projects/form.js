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
			var template = _.template(ProjectFormTemplate)
			this.$el.html(template);
		},

		post: function (e) {
			e.preventDefault();

      var title, description;

      title       = $(".project-name").val();
      description = $(".project-description").val();
  
      this.collection.trigger("project:post", title, description);
		}

	});

	return ProjectFormView;
});
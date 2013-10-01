define([
	'jquery',
	'underscore',
	'backbone',
	'text!project_list_template'
], function ($, _, Backbone, ProjectListTemplate) {

	var ProjectsCollectionView = Backbone.View.extend({

		render: function () {
			var projectsJSON = {
				projects: this.options.collection.toJSON()
			}

			this.compiledTemplate = _.template(ProjectListTemplate, projectsJSON)
			this.$el.html(this.compiledTemplate);

			// Allow chaining.
			return this;
		}

	});

	return ProjectsCollectionView;
});
define([
	'jquery',
	'underscore',
	'backbone',
	'base_controller',
	'project_item_view'
], function ($, _, Backbone, BaseController, ProjectItemView) {

	Application.Project = {};

	Application.Project.ShowController = BaseController.extend({

		events: {

		},

		initialize: function () {
			this.rendered = true;
			this.renderShowView();

			// Here what we do is trigger that this has happened,
			// then what we do is use this in another place to render controllers.
			rendering.trigger("project:show");
		},

		renderShowView: function () {
			this.projectShowItemView ? 
				this.projectShowItemView.initialize() :
				this.projectShowItemView = new ProjectItemView({ model: this.model }).render();
		}
	
	});

	return Application.Project.ShowController;
});
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
		},

		renderShowView: function () {
			if (this.projectShowItemView) {
				this.projectShowItemView.initialize();
			} else {
				this.projectShowItemView = new ProjectItemView({ model: this.model });
			}
		}
	
	});

	return Application.Project.ShowController;
});
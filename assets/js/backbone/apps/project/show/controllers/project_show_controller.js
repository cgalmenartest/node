define([
	'jquery',
	'underscore',
	'backbone',
	'base_controller',
	'project_item_view'
], function ($, _, Backbone, BaseController, ProjectItemView) {

	Application.Project = {};

	Application.Project.ShowController = BaseController.extend({

		initialize: function () {
			this.rendered = true;
			this.renderShowView();

			// Experimenting with Backbone.history
			// Backbone.history.navigate("projects/" + this.model.id, {trigger: true});

			// Here what we do is trigger that this has happened,
			// then what we do is use this in another place to render controllers.
			rendering.trigger("project:show", this.model.id);
		},

		renderShowView: function () {
			var self = this;

			this.model.trigger("project:model:fetch", this.model.id);	
			this.listenToOnce(this.model, "project:model:fetch:success", function (model) {
				self.fireUpViewWithModelData(model);
			});
		},

		fireUpViewWithModelData: function (model) {
			this.projectShowItemView ? 
				this.projectShowItemView.cleanup() :
				this.projectShowItemView = new ProjectItemView({ model: model }).render();
			rendering.trigger("project:show:rendered");
		},
		 	
		cleanup: function() {
		  $(this.el).remove();
		}

	
	});

	return Application.Project.ShowController;
});
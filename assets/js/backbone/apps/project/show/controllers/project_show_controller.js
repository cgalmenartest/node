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
			var self = this;

			this.model.trigger("project:model:fetch", this.model.id);	
			this.listenTo(this.model, "project:model:fetch:success", function (model) {
				self.fireUpViewWithModelData(model);
			});
		},

		fireUpViewWithModelData: function (model) {
			this.projectShowItemView ? 
				this.projectShowItemView.cleanup() :
				this.projectShowItemView = new ProjectItemView({ model: model }).render();
		},
		 	
		cleanup: function() {
		  this.undelegateEvents();
		  $(this.el).remove();
		}

	
	});

	return Application.Project.ShowController;
});
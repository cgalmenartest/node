define([
	'jquery',
	'underscore',
	'backbone',
	'base_controller'
], function ($, _, Backbone, BaseController) {

	Application.Project.ShowController = BaseController.extend({

		events: {

		},

		initialize: function () {
			this.rendered = true;
			
		}
	
	});

	return Application.Project.ShowController;
});
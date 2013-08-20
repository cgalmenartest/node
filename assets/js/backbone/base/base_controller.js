// Base Controller

define([
	'underscore',
	'backbone'
], function (_, Backbone) {

	Application.Controller.BaseController = Backbone.View.extend({
		
		initialize: function () {

		},

		initializeViewSafely: function (viewName) {
			if (this.view) {
				this.view.initialize();
			} else {
				this.view = new viewName();
			}
		}

	});

	return Application.Controller.BaseController;

});
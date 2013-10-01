define([
	'jquery',
	'underscore',
	'backbone',
	'base_controller',
	'marketing_home_view'
], function ($, _, Backbone, BaseController, MarketingHomeView) {

	Application.Controller = {};
	
	Application.Controller.Marketing = BaseController.extend({

		initialize: function () {
			this.initializeHomeView()
		},

		initializeHomeView: function () {
			if (this.marketingHomeView) this.marketingHomeView.cleanup()
			this.marketingHomeView = new MarketingHomeView({
				el: "#container"
			}).render();
		}
	
	});

	return Application.Controller.Marketing;
})
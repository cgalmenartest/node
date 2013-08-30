define([
	'underscore',
	'backbone',
	'base_controller',
	'marketing_home_view'
], function (_, Backbone, BaseController, MarketingHomeView) {

	Application.Controller = {};
	
	Application.Controller.Marketing = BaseController.extend({

		initialize: function () {
			this.initializeHomeView();
		},

		initializeHomeView: function () {
			this.marketingHomeView ? 
				this.marketingHomeView.render() :
				this.marketingHomeView = new MarketingHomeView({
					el: "#container"
				}).render();
		}
	
	});

	return Application.Controller.Marketing;
})
define([
	'underscore',
	'backbone',
	'base_app_module',
	'marketing_home_controller'
], function (_, Backbone, BaseAppModule, MarketingHomeController) {

	Application.AppModule.Marketing = BaseAppModule.extend({

		initialize: function () {
			this.rendered = true;
			this.initializeControllerSafely(this.rendered, MarketingHomeController)
		}

	});

	return Application.AppModule.Marketing;
})
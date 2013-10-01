define([
	'underscore',
	'backbone',
	'base_app_module',
	'marketing_home_controller'
], function (_, Backbone, BaseAppModule, MarketingHomeController) {

	Application.AppModule.Marketing = BaseAppModule.extend({

		initialize: function () {
			$("#container").children().remove()
			this.rendered = true;
			this.initializeControllerSafely(this.rendered, MarketingHomeController)
		},

		cleanup: function () {
			$(this.el).children().remove();
			this.undelegateEvents()
		}

	});

	return Application.AppModule.Marketing;
})
// Base App Module

define([
	'underscore',
	'backbone'
], function (_, Backbone) {
	
	Application.AppModule.BaseAppModule = Backbone.View.extend({
		
		initializeControllerSafely: function (appModuleRenderState, controllerToRender) {
			if (appModuleRenderState === true) {
				if (this.controller) {
					this.controller.initialize();
				} else {
					this.controller = new controllerToRender();
				}
			} else {
				// Can only load controllers within an application module if the appmod rendered safely.
				return;
			}
		}

	});

	return Application.AppModule.BaseAppModule;

});
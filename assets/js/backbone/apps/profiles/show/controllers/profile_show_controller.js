define([
	'jquery',
	'underscore',
	'backbone',
	'base_controller',
	'profile_model',
	'profile_show_view'
], function ($, _, Backbone, BaseController, ProfileModel, ProfileView) {
	
	Application.Controller.Profile = BaseController.extend({

		initialize: function () {
			this.initializeProfileModelInstance();
			this.initializeProfileViewInstance();
		},

		initializeProfileModelInstance: function () {
			if (this.model) this.model.remove();
			this.model = new ProfileModel();
		},

		initializeProfileViewInstance: function () {
			this.profile ?
				this.profile.cleanup() :
				this.profile = new ProfileView({
					el: "#container",
					model: this.model
				});
		}

	});

	return Application.Controller.Profile;
})
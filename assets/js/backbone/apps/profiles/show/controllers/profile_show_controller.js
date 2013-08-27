define([
	'jquery',
	'underscore',
	'backbone',
	'base_controller',
	'profile_model',
	'profile_show_view'
], function ($, _, Backbone, BaseController, ProfileModel, ProfileView) {
	
	Application.Controller.Profile = BaseController.extend({

		// Here we are defining wether or not this is a full-region object
		// or a sub-region of another region.
		region: true,
		subRegion: false,

		el: "#container",

		initialize: function () {
			this.initializeProfileModelInstance();
		},

		initializeProfileModelInstance: function () {
			var self = this;

			if (this.model) this.model.remove();
			this.model = new ProfileModel();
			this.model.trigger("profile:fetch");
      this.listenTo(this.model, "profile:fetch:success", function (model) {
        // @instance
        self.model = model;
        self.initializeProfileViewInstance();
      });
		},

		initializeProfileViewInstance: function () {
			this.profile ?
				this.profile.cleanup() :
				this.profile = new ProfileView({
					el: this.$el,
					model: this.model
				}).render();
		}

	});

	return Application.Controller.Profile;
})
define([
	'underscore',
	'backbone',
	'../views/profile/show'
], function (_, Backbone, ProfileView) {

	var ProfileModel = Backbone.Model.extend({

		defaults: {
			username	: null,
			photo			: null
		},

		urlRoot: '/user',

		initialize: function () {
			this.initializeProfileSave();
			this.initializeProfileGet();
		},

		initializeProfileGet: function () {
			var _this = this;

			this.on("profile:fetch", function () {
				_this.fetch({
					success: function (data) {
						var profileView = new ProfileView({ model: data });
					},
					error: function (data) {
						console.log(data);
					}
				});
			});
		},

		initializeProfileSave: function () {
			var _this = this;

			this.on("profile:save", function (serializedProfileForm) {
				console.log(serializedProfileForm);
				_this.save({
					// db : local name
					photo: photo
				}, { 	
				success: function (data) { 
					console.log(data);
				},
				error: function (data) {
					console.log(data);
				} 
				});
			});
		}

	});

	return ProfileModel;
});
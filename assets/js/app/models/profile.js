define([
	'underscore',
	'backbone',
	'../views/profile/show'
], function (_, Backbone, ProfileView) {

	var ProfileModel = Backbone.Model.extend({

		defaults: {
			username	: null
		},

		urlRoot: '/user/index',

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


			this.on("profile:updateWithPhotoId", function(file) {
				var _self = this;
				_this.save({
					photoId: file['id']
				}, {
				success: function (data) {
					_this.trigger("profile:updatedPhoto", data);
				},
				error: function (data) {
					console.log(data);
				}
				});
			});

			this.on("profile:save", function (serializedProfileForm) {
				console.log(serializedProfileForm);

				_this.save({
					// db : local name
					photoId: photoId
				}, { 	
				success: function (data) { 
					console.log(data);
					this.trigger("profilePhoto:update", data);
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
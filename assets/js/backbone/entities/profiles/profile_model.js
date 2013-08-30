define([
	'underscore',
	'backbone'
], function (_, Backbone) {
	'use strict';

	var ProfileModel = Backbone.Model.extend({

		urlRoot: '/user/index',

		initialize: function () {
			this.initializeProfileSave();
			this.initializeProfileGet();
		},

		initializeProfileGet: function () {
			var self = this;

			this.listenTo(this, "profile:fetch", function () {
				self.fetch({
					success: function (data) {
						self.trigger("profile:fetch:success", data);
					},
					error: function (data) {
						console.log(data);
					}
				});
			});
		},

		initializeProfileSave: function () {
			var _this = this;

			this.listenTo(this, "profile:updateWithPhotoId", function(file) {
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

			this.listenTo(this, "profile:save", function (form) {
				_this.save({
					name: form['name'],
					username: form['username']
				}, {
				success: function (data) {
					console.log(data);
					_this.trigger("profile:saveDone", data);
				},
				error: function (data) {
					_this.trigger("profile:saveDone", data);
					console.log(data);
				}
				});
			});

			this.listenTo(this, "profile:removeAuth", function(id) {
				var auths = this.get("auths");
				auths.splice(auths.indexOf(id), 1);
				_this.save({
					auths: auths
				}, {
				success: function (data) {
					console.log(data);
					_this.trigger("profile:removeAuthDone", data, id);
				},
				error: function (data) {
					_this.trigger("profile:removeAuthDone", data, id);
					console.log(data);
				} 
				});
			});

		}

	});

	return ProfileModel;
});
define([
	'underscore',
	'backbone'
], function (_, Backbone) {

	var ProfileModel = Backbone.Model.extend({

		urlRoot: '/api/user',

		initialize: function () {
			this.initializeProfileSave();
			this.initializeProfileGet();
		},

		initializeProfileGet: function () {
			var self = this;

			this.listenTo(this, "profile:fetch", function (id) {
				self.remoteGet(id);
			});
		},

    remoteGet: function (id) {
      var self = this;
      if (id) {
	      this.set({ id: id });
      }
      this.fetch({
        success: function (model, response, options) {
          self.trigger("profile:fetch:success", model);
        },
        error: function (model, response, options) {
          self.trigger("profile:fetch:error", model, response);
        }
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
					// an error occurred
				}
				});
			});

			this.listenTo(this, "profile:save", function (form) {
				_this.save({
					name: form['name'],
					username: form['username'],
					title: form['title'],
					bio: form['bio']
				}, {
				success: function (data) {
					_this.trigger("profile:save:success", data);
				},
				error: function (data) {
					_this.trigger("profile:save:fail", data);
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
					_this.trigger("profile:removeAuth:success", data, id);
				},
				error: function (data) {
					_this.trigger("profile:removeAuth:fail", data, id);
				} 
				});
			});

		}

	});

	return ProfileModel;
});
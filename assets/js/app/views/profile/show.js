define([
	'jquery',
	'underscore',
	'backbone',
	'../../models/profile',
	'text!../../../../templates/profile/show.html'
], function ($, _, Backbone, ProfileModel, ProfileTemplate) {

	var ProfileShowView = Backbone.View.extend({

		el: "#container",

		initialize: function () {
			this.model = new ProfileModel();
			this.model.trigger("profile:fetch");
		},

		render: function () {
			var template = _.template(ProfileTemplate, this.model.toJSON());
			this.$el.html(template)
		}

	});

	return ProfileShowView;
});
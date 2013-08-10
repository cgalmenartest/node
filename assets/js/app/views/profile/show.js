define([
	'jquery',
	'underscore',
	'backbone',
	'text!../../../../../templates/profile/show.html'
], function ($, _, Backbone, ProfileTemplate) {

	var ProfileShowView = Backbone.View.extend({

		el: "#container",

		initialize: function () {
			this.render();
		},

		render: function () {
			var data 			= this.model.toJSON()[0]
					template 	= _.template(ProfileTemplate, data);

			this.$el.html(template)
		}

	});

	return ProfileShowView;
});
define([
	'jquery',
	'underscore',
	'backbone',
	'text!../../../../../templates/profile/show.html'
], function ($, _, Backbone, ProfileTemplate) {

	var ProfileShowView = Backbone.View.extend({

		el: "#container",

		events: {
			"submit #profile-form": "post"
		},

		initialize: function () {
			this.render();
		},

		render: function () {
			var data 			= this.model.toJSON()
					template 	= _.template(ProfileTemplate, data);

			this.$el.html(template)
		},

		post: function (e) {
			if (e.preventDefault()) e.preventDefault();
			
			alert("Profile post button hit.  Modify from here");
		}

	});

	return ProfileShowView;
});
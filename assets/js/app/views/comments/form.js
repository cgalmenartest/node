define([
	'jquery',
	'underscore',
	'backbone',
	'../../models/comment',
	'text!../../../../templates/comments/form.html'
], function ($, _, Backbone, CommentModel, CommentFormTemplate) {

	var CommentFormView = Backbone.View.extend({

		el: ".comment-form-wrapper",

		events: {
			"submit #comment-form": "post"
		},

		render: function () {
			var data = {};
			var template = _.template(CommentFormTemplate, data);
			this.$el.html(template);
		},

		post: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var comment 		= $(".comment-content").val(),
					projectId 	= parseInt($(".project-id").text());

			this.model = new CommentModel();
			this.model.trigger("comment:save", comment, projectId);
		}

	});

	return CommentFormView;
})
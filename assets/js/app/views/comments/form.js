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

		initialize: function (options) {
			this.options = options;
		},

		render: function () {
			var data = {};
			var template = _.template(CommentFormTemplate, data);
			this.$el.html(template);
		},

		post: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var comment 		= $(".comment-content").val();
			var projectId 	= parseInt($(".project-id").text());

			if (this.options) {
				var parentId = parseInt(this.options.parentId);
			}

			this.model = new CommentModel();
			this.model.trigger("comment:save", parentId, comment, projectId);
		}

	});

	return CommentFormView;
})
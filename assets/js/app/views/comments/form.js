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
			var data 			= {},
					template 	= _.template(CommentFormTemplate, data);

			this.$el.html(template);
		},

		post: function (e) {
			if (e.preventDefault()) e.preventDefault();

			var comment 		= $(".comment-content").val(),
					projectId 	= parseInt($(".project-id").text()),
					parentId;

			if (this.options) {
				parentId = parseInt(this.options.parentId);
			}

			this.model = new CommentModel();
			this.model.trigger("comment:save", parentId, comment, projectId);
		}

	});

	return CommentFormView;
})
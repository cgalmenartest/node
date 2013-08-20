define([
	'jquery',
	'underscore',
	'backbone',
	'../../models/comment',
	'text!../../../../templates/comments/form.html'
], function ($, _, Backbone, CommentModel, CommentFormTemplate) {
	'use strict';	

	var CommentFormView = Backbone.View.extend({

		el: ".comment-form-wrapper",

		events: {
			"submit #comment-form": "post",
			"click #comment": "add"
		},

		initialize: function (options) {
			this.options = options;
		},

		render: function () {
			var data 			= {},
					template 	= _.template(CommentFormTemplate, data);

			this.$el.html(template);
			
			return this;
		},

		post: function (e) {
			if (e.preventDefault()) e.preventDefault();

			if ($(e.currentTarget).children(".comment-content").val() !== "") {
				this.comment = $(e.currentTarget).children(".comment-content").val();
			} else {
				this.comment = $(".comment-content").val();
			}

			var projectId 	= parseInt($(".project-id").text()),
					parentId;

			if (this.options) {
				parentId = parseInt(this.options.parentId);
			}

			this.model = new CommentModel();
			this.model.trigger("comment:save", parentId, this.comment, projectId);
		}

	});

	return CommentFormView;
})
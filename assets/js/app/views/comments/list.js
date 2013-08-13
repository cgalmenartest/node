define([
	'jquery',
	'underscore',
	'backbone',
	'../../collections/comments',
	'text!../../../../templates/comments/list.html',
	'../../views/comments/form'
], function ($, _, Backbone, CommentsCollection, CommentListTemplate, CommentForm) {

	var CommentListView = Backbone.View.extend({

		el: ".comment-list-wrapper",

		events: {
			"click .reply-to": "reply"
		},

		initialize: function (collection) {
			this.collection = collection;
			this.render();
		},

		render: function () {
			console.log(this.collection);
			compiledTemplate = _.template(CommentListTemplate, this.collection)
			$(".comment-list-wrapper").html(compiledTemplate);

			app.events.on("comment:render", function () {
				$(".comment-content").val("");
				$("html, body").animate({ scrollTop: $(document).height() });
			});
		},

		reply: function (e) {
			if (e.preventDefault()) e.preventDefault();

			new CommentForm({
				el: $(e.currentTarget).parent(),
				parentId: $(e.currentTarget).attr("data-comment-id")
			}).render();
		}

	});

	return CommentListView;
});

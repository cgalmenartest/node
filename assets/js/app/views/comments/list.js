define([
	'jquery',
	'underscore',
	'backbone',
	'../../collections/comments',
	'text!../../../../templates/comments/list.html'
], function ($, _, Backbone, CommentsCollection, CommentListTemplate) {

	var CommentListView = Backbone.View.extend({

		initialize: function (collection) {
			this.collection = collection;
			this.render();
		},

		render: function () {
			compiledTemplate = _.template(CommentListTemplate, this.collection)
			$(".comment-list-wrapper").html(compiledTemplate);

			app.events.on("comment:render", function () {
				$(".comment-content").val("");
				$("html, body").animate({ scrollTop: $(document).height() });
			});
		}

	});

	return CommentListView;
});

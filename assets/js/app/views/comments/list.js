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
			var id = parseInt($(".project-id").text());

			if (this.model) {
				this.model.on("change", this.render, this);
				console.log(this.model);
			}
		},

		render: function () {
			compiledTemplate = _.template(CommentListTemplate, this.collection)
			$(".comment-list-wrapper").html(compiledTemplate);
			
			// Commented out for a note on future refactor:
			// this.collection.each(this.renderOne);
			// return this;
		},

		// Commented out due to experimentation (and refactor thoughts):
		// renderOne: function () {
		// 	var comment = new CommentView({ model: model })
		// 	this.$el.append(row.render().$el);
		// 	return this;
		// }

	});

	return CommentListView;
});

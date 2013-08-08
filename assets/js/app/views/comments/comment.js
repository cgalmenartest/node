define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {

	var CommentView = Backbone.View.extend({

		// model: collection.model,

		render: function () {
			tmpl = _.template(this.template, this.model.toJSON());
			this.$el.html(tmpl);
			return this;
		}
		
	});

	return CommentView;

})
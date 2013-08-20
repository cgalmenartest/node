define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	'use strict';

	var CommentView = Backbone.View.extend({
		
		render: function () {
			tmpl = _.template(this.template, this.model.toJSON());
			this.$el.html(tmpl);
			return this;
		}
		
	});

	return CommentView;

})
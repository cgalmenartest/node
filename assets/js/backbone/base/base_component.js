define([
  'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {

	Application.Component.BaseComponent = Backbone.View.extend({

		initialize: function () {}

	});

	return Application.Component.BaseComponent;
})
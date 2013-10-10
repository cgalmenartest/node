define([
	'jquery',
	'underscore',
	'backbone',
	'utilities',
	'text!task_list_template'
], function ($, _, Backbone, utils, TaskListTemplate) {

	var TasksCollectionView = Backbone.View.extend({

		el: "#task-list-wrapper",

		initialize: function () {
			this.render();
		},

		render: function () {
			
			var tasksJSON = {
				tasks: this.options.collection.toJSON()
			}

			this.compiledTemplate = _.template(TaskListTemplate, tasksJSON);
			this.$el.html(this.compiledTemplate);

			return this;
		},

		cleanup: function () {
			removeView(this);
		}

	});

	return TasksCollectionView;
});
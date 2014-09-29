define([
	'jquery',
	'underscore',
	'backbone',
	'utilities',
	'async',
	'marked',
	'text!task_list_template'
], function ($, _, Backbone, utils, async, marked, TaskListTemplate) {

	var TasksCollectionView = Backbone.View.extend({

		el: "#task-list-wrapper",

		initialize: function (options) {
			this.options = options;
			this.requestTagData();
		},

		requestTagData: function () {
			var self = this;

			this.tasksJson = {
				tasks: this.options.collection.toJSON(),
				user: window.cache.currentUser
			};

			var requestTagData = function (task, done) {
				$.ajax({
					url: '/api/tag/findAllByTaskId/' + task.id,
					async: false,
					success: function (tags) {
						task['tags'] = tags;
						done();
					},
					error: function () {
						task['tags'] = [];
						done();
					}
				});
			}

			async.each(this.tasksJson.tasks, requestTagData, function () {
				self.render();
			});

		},

		render: function () {
			_.each(this.tasksJson.tasks, function(task) {
				task.description = marked(task.description);
			});
			this.compiledTemplate = _.template(TaskListTemplate, this.tasksJson);
			this.$el.html(this.compiledTemplate);

			return this;
		},

		cleanup: function () {
			removeView(this);
		}

	});

	return TasksCollectionView;
});
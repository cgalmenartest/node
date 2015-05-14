
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var async = require('async');
var marked = require('marked');
var TaskListTemplate = require('../templates/task_collection_view_template.html');


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

			self.render();
		},

		render: function () {
			_.each(this.tasksJson.tasks, function(task) {
				// Filter out "Required"/"Not Required" from the task tag cloud
				task.tags = _.filter(task.tags, function(tag) {
					return tag.type !== "task-skills-required";
				});
				task.description = marked(task.description);
			});
			this.compiledTemplate = _.template(TaskListTemplate)(this.tasksJson);
			this.$el.html(this.compiledTemplate);

			return this;
		},

		cleanup: function () {
			removeView(this);
		}

	});

	module.exports = TasksCollectionView;

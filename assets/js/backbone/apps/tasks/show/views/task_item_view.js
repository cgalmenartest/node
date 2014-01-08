define([
  'bootstrap',
  'underscore',
  'backbone',
  'utilities',
  'async',
  'jquery_timeago',
  'base_view',
  'text!task_show_template'
], function (Bootstrap, _, Backbone, utils, async, TimeAgo, BaseView, TaskShowTemplate) {

  var TaskItemView = BaseView.extend({

    initialize: function (options) {
      var self = this;
      this.model.trigger("task:model:fetch", this.options.id);
      this.listenTo(this.model, "task:model:fetch:success", function (model) {
        self.model = model;
        self.initializeTags(self);
      });
    },

    getTagData: function (self, cb) {
      $.ajax({
        url: '/api/tag/findAllByTaskId/' + self.options.id,
        async: false,
        success: function (data) {
          self.tags = [];
          for (var i = 0; i < data.length; i += 1) {
            self.tags.push(data[i]);
          }
          // Build object for render
          self.data = {
            user: window.cache.currentUser,
            model: self.model.toJSON(),
            tags: self.tags
          };
          self.data['madlibTags'] = organizeTags(self.tags);
          self.model.trigger('task:tag:data', self.tags, self.data['madlibTags']);
          return cb();
        }
      });

    },

    render: function (self) {
      self.getTagData(self, function () {
        var compiledTemplate = _.template(TaskShowTemplate, self.data);
        self.$el.html(compiledTemplate);
        $("time.timeago").timeago();
        self.model.trigger('task:show:render:done');
      });
    },

    initializeTags: function (self) {
      var types = ["task-skills-required", "task-time-required", "task-people", "task-length", "task-time-estimate"];

      self.tagSources = {};

      var requestAllTagsByType = function (type, cb) {
        $.ajax({
          url: '/api/ac/tag?type=' + type + '&list',
          type: 'GET',
          async: false,
          success: function (data) {
            // Dynamically create an associative
            // array based on that for the pointer to the list itself to be iterated through
            // on the front-end.
            self.tagSources[type] = data;
            return cb();
          }
        });
      }

      async.each(types, requestAllTagsByType, function (err) {
        self.model.trigger('task:tag:types', self.tagSources);
        self.render(self);
      });
    },

    cleanup: function() {
      removeView(this);
    }
  });

  return TaskItemView;
})
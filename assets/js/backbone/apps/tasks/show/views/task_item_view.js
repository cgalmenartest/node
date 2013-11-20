define([
  'bootstrap',
  'popovers',
  'underscore',
  'backbone',
  'utilities',
  'async',
  'base_view',
  'text!task_show_template'
], function (Bootstrap, Popovers, _, Backbone, utils, async, BaseView, TaskShowTemplate) {

  var TaskItemView = BaseView.extend({

    initialize: function (options) {
      var self = this;
      this.model.trigger("task:model:fetch", this.options.id);
      this.listenTo(this.model, "task:model:fetch:success", function (model) {
        self.model = model;
        self.getTagData();
        self.render();
      });
    },

    getTagData: function () {
      var self = this;

      $.ajax({
        url: '/api/tag/findAllByTaskId/' + self.options.id,
        async: false,
        success: function (data) {
          self.tags = [];
          for (var i = 0; i < data.length; i += 1) {
            self.tags.push(data[i]);
          }
        }
      });

      // Build object for render
      this.data = {
        model: self.model.toJSON(),
        tags: this.tags,
        madlibTags: {}
      };

      // Call to organize tags now that we have built render obj.
      self.organizeTags(self.tags);
    },

    organizeTags: function (tags) {
      // Put the tags into their types
      var outTags = {};
      for (t in tags) {
        if (!(_.has(outTags, tags[t].tag.type))) {
          outTags[tags[t].tag.type] = [];
        }
        outTags[tags[t].tag.type].push(tags[t].tag);
      }

      // If a tag only has one item, make it a top level object
      for (var j in outTags) {
        if (outTags[j].length === 1) {
          var obj = outTags[j].pop();
          outTags[j] = obj
        }
        this.data.madlibTags[outTags[j].type] = outTags[j].name;
      }
      return this.data.madlibTags;
    },

    render: function () {
      this.initializeSelect2Data();

      var compiledTemplate = _.template(TaskShowTemplate, this.data);
      this.$el.html(compiledTemplate)
    },

    initializeSelect2Data: function () {
      var self = this,
          types = ["task-skills-required", "task-time-required", "task-people", "task-length", "task-time-estimate"];

      this.tagSources = {};

      var requestAllTagsByType = function (type) {
        $.ajax({
          url: '/api/ac/tag?type=' + type + '&list',
          type: 'GET',
          async: false,
          success: function (data) {
            // Dynamically create an associative
            // array based on that for the pointer to the list itself to be iterated through
            // on the front-end.
              self.tagSources[type] = data;
          }
        });
      }

      async.each(types, requestAllTagsByType, function (err) {
        self.render();
      });
    }
  });

  return TaskItemView;
})
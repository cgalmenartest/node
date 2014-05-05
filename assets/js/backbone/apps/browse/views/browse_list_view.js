define([
  'jquery',
  'underscore',
  'backbone',
  'async',
  'utilities',
  'marked',
  'tag_config',
  'text!project_list_item',
  'text!task_list_item'
], function ($, _, Backbone, async, utils, marked, TagConfig, ProjectListItem, TaskListItem) {

  var BrowseListView = Backbone.View.extend({

    initialize: function (options) {
      this.options = options;
    },

    organizeTags: function (tags) {
      // put the tags into their types
      var outTags = {};
      for (t in tags) {
        if (!(_.has(outTags, tags[t].tag.type))) {
          outTags[tags[t].tag.type] = [];
        }
        outTags[tags[t].tag.type].push(tags[t].tag);
      }
      return outTags;
    },

    render: function () {
      // render each item
      for (var l in this.options.collection) {
        var item = {
          item: this.options.collection[l],
          user: window.cache.currentUser,
          tagConfig: TagConfig,
          tagShow: ['location', 'skill', 'topic', 'task-time-estimate', 'task-time-required']
        }
        if (this.options.collection[l].tags) {
          item.tags = this.organizeTags(this.options.collection[l].tags);
        }
        if (this.options.collection[l].description) {
          item.item.descriptionHtml = marked(this.options.collection[l].description);
        }
        var compiledTemplate = '';
        if (this.options.target == 'projects') {
          compiledTemplate = _.template(ProjectListItem, item);
        } else {
          compiledTemplate = _.template(TaskListItem, item);
        }
        this.$el.append(compiledTemplate);
      }

      return this;
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return BrowseListView;
});
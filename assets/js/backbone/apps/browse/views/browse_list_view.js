define([
  'jquery',
  'underscore',
  'backbone',
  'async',
  'utilities',
  'popovers',
  'text!project_list_item',
  'text!task_list_item'
], function ($, _, Backbone, async, utils, Popovers, ProjectListItem, TaskListItem) {

  var popovers = new Popovers();

  var BrowseListView = Backbone.View.extend({

    events: {
      "mouseenter .project-people-div"  : popovers.popoverPeopleOn,
      "click      .project-people-div"  : popovers.popoverClick
    },

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
          user: window.cache.currentUser
        }
        if (this.options.collection[l].tags) {
          item.tags = this.organizeTags(this.options.collection[l].tags);
        }
        var compiledTemplate = '';
        if (this.options.target == 'projects') {
          compiledTemplate = _.template(ProjectListItem, item);
        } else {
          compiledTemplate = _.template(TaskListItem, item);
        }
        this.$el.append(compiledTemplate);
        popovers.popoverPeopleInit(".project-people-div");
      }

      return this;
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return BrowseListView;
});
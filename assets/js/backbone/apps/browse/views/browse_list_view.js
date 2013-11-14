define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!project_list_item'
], function ($, _, Backbone, utils, ProjectListItem) {

  var BrowseListView = Backbone.View.extend({

    render: function () {
      // render each project
      for (var l in this.options.collection) {
        var item = {
          item: this.options.collection[l],
          user: window.cache.currentUser
        }
        var compiledTemplate = _.template(ProjectListItem, item);
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
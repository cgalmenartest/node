define([
  'jquery',
  'underscore',
  'jquery_timeago',
  'backbone',
  'text!comment_list_template'
], function ($, _, TimeAgo, Backbone, CommentListTemplate) {

  var CommentListView = Backbone.View.extend({

    template: _.template(CommentListTemplate),

    render: function () {
      var compiledTemplate = this.template(this.collection.toJSON()[0]);
      this.$el.html(compiledTemplate);
      $("time.timeago").timeago();
    }

  });

  return CommentListView;
});
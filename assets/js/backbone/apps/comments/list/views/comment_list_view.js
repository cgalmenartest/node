define([
  'jquery',
  'underscore',
  'jquery_timeago',
  'backbone',
  'utilities',
  'text!comment_list_template'
], function ($, _, TimeAgo, Backbone, Utils, CommentListTemplate) {

  var CommentListView = Backbone.View.extend({

    events: {
      'click #project-topic-new': 'showTopicForm',
      'submit #comment-topic-form': 'newTopic'
    },

    template: _.template(CommentListTemplate),

    showTopicForm: function() {
      $('.project-topic-form').show();
    },

    newTopic: function(e) {
      if (e.preventDefault()) e.preventDefault();
      var value;
      if ($(e.currentTarget).find(".comment-content").val() !== "") {
        value = $(e.currentTarget).find(".comment-content").text();
      } else {
        value = $(e.currentTarget).find(".comment-content:first-child").text();
      }
      this.collection.trigger('comment:topic:new', value);
    },

    render: function () {
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return CommentListView;
});
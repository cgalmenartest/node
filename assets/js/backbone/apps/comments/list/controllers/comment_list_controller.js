define([
  'jquery',
  'underscore',
  'backbone',
  'popovers',
  'comment_collection',
  'comment_list_view'
], function ($, _, Backbone, Popovers, CommentCollection, CommentListView) {

  Application.Controller.Comment = Backbone.View.extend({

    el: ".comment-list-wrapper",

    events: {
      "click .reply-to": "reply",
      "mouseenter .comment-user-link" : popoverPeopleOn,
      "mouseleave .comment-user-link" : popoverPeopleOff
      // "click .comment-user-link" : popoverPeopleOn
    },

    initialize: function () {
      this.initializeCommentCollection();
    },

    initializeCommentCollection: function () {
      var self = this;

      if (this.commentCollection) {
        this.commentCollection.destroy();
      }

      this.commentCollection = new CommentCollection();
      this.commentCollection.fetch({
        url: '/comment/findAllByProjectId/' + this.options.projectId,
        success: function (collection) {
          self.renderView(collection);
        }
      })
    },

    renderView: function (collection) {
      if (this.commentListView) {
        this.commentListView.cleanup();
      } 

      this.commentListView = new CommentListView({
        el: ".comment-list-wrapper",
        collection: collection
      }).render();

      popoverPeopleInit(".comment-user-link");
    },

    reply: function (e) {
      if (e.preventDefault()) e.preventDefault();


    },

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return Application.Controller.Comment;
});

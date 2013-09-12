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
      "mouseenter .project-people-div" : popoverPeopleOn,
      "mouseleave .project-people-div" : popoverPeopleOff,
      "click .project-people-div" : popoverPeopleOn
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

      popoverPeopleInit(".project-people-div");
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

define([
  'jquery',
  'underscore',
  'backbone',
  'popovers',
  'comment_collection',
  'comment_list_view',
  'comment_form_view'
], function ($, _, Backbone, Popovers, CommentCollection, CommentListView, CommentFormView) {

  Application.Controller.Comment = Backbone.View.extend({

    el: ".comment-list-wrapper",

    events: {
      "click .reply-to": "reply",
      "mouseenter .comment-user-link" : popoverPeopleOn,
      "mouseleave .comment-user-link" : popoverPeopleOff
    },

    initialize: function () {
      this.initializeCommentCollection();
      this.commentCollection.on("comment:save:success", this.initializeCommentCollection())
    },

    initializeCommentCollection: function () {
      var self = this;

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
      var self = this;
      rendering.trigger("renderForm")
      rendering.once("renderForm", function () {
        if (this.commentForm) this.commentForm.cleanup();
        this.commentForm = new CommentFormView({ projectId: self.options.projectId, collection: collection });  
      })
      
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

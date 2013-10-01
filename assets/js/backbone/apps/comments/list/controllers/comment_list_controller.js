define([
  'underscore',
  'backbone',
  'popovers',
  'comment_collection',
  'comment_list_view',
  'comment_form_view'
], function (_, Backbone, Popovers, CommentCollection, CommentListView, CommentFormView) {

  Application.Controller.Comment = Backbone.View.extend({

    el: ".comment-list-wrapper",

    events: {
      "click .reply-to": "reply",
      "mouseenter .comment-user-link" : popoverPeopleOn,
      "mouseleave .comment-user-link" : popoverPeopleOff
    },

    initialize: function () {
      this.initializeCommentCollection();
      this.initializeListeners();
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
      });
    },

    initializeListeners: function() {
      var self = this;

      this.listenTo(this.commentCollection, "comment:topic:new", function (value) {
        var data = {
          projectId: self.options.projectId,
          value: value,
          topic: true
        };
        // TODO: DM: Fix this to add to the collection appropriately,
        // and fetch/re-render as needed.  This is a hack to get it to work
        $.ajax({
          url: '/comment',
          type: 'POST',
          contentType: 'application/json',
          processData: false,
          data: JSON.stringify(data)
        }).done(function (result) {
          self.commentCollection.fetch({
            url: '/comment/findAllByProjectId/' + self.options.projectId,
            success: function (collection) {
              self.commentListView = new CommentListView({
                el: ".comment-list-wrapper",
                collection: collection
              }).render();
            }
          });
        });
      });
    },

    renderView: function (collection) {
      var self = this;
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
        var comments = self.commentCollection.toJSON()[0].comments;
        for (var i = 0; i < comments.length; i++) {
          if (comments[i].topic === true) {
            var view = new CommentFormView({
              el: '#comment-topic-' + comments[i].id,
              projectId: self.options.projectId,
              parentId: comments[i].id,
              collection: collection
            });
          }
        }
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

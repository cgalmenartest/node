define([
  'jquery',
  'underscore',
  'backbone',
  'popovers',
  'comment_collection',
  'comment_list_view',
  'comment_form_view',
  'comment_item_view',
  'topic_view'
], function ($, _, Backbone, Popovers, CommentCollection, CommentListView, CommentFormView, CommentItemView, TopicView) {

  Application.Controller.Comment = Backbone.View.extend({

    el: ".comment-list-wrapper",

    events: {
      "click .reply-to"               : "reply",
      "mouseenter .comment-user-link" : popoverPeopleOn,
      "mouseleave .comment-user-link" : popoverPeopleOff
    },

    initialize: function () {
      var self = this;

      this.initializeCommentCollection();
      this.initializeListeners();
      this.listenToOnce(this.commentCollection, "comment:save:success", function () {
        self.initializeCommentCollection()
      })
    },

    initializeCommentCollection: function () {
      var self = this;

      if (this.commentCollection) {
        this.commentCollection;
      } else {
        this.commentCollection = new CommentCollection();
      }

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
              console.log(collection.models[0].attributes.comments)
              // For each of the models coming back from the server (topic)
              // iterate over them and render the item view for that topic.


                // var comment = new CommentItemView({
                //   el: ".comment-item",
                //   model: comment
                // }).render()

              // self.commentListView = new CommentListView({
              //   el: ".comment-list-wrapper",
              //   collection: collection
              // }).render();
            }
          });
        });
      });
    },

    renderView: function (collection) {
      var self = this;

      _.each(collection.models[0].attributes.comments, function (comment) {

        if (comment.comments && comment.comments.length !== 0) {

          // Render the topic view and then in that view spew out all of its children.
          // console.log("Comment's with children:");
          self.topic = new TopicView({
            el: ".comment-list-wrapper",
            model: comment
          }).render();

        } else if (!comment.topic && comment.parentId === null) {

          // console.log("Comment's with no parents");
          self.independentComment = new CommentItemView({
            el: ".comment-list-wrapper",
            model: comment
          });

        }

      });

      // this.commentListView = new CommentListView({
      //   el: ".comment-list-wrapper",
      //   collection: collection
      // }).render();

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
      this.remove();
      this.undelegateEvents()
    }

  });

  return Application.Controller.Comment;
});

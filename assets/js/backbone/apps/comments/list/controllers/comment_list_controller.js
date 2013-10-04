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
      "click [data-topic='true']"     : "toggleTopic",
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
            model: comment,
            projectId: self.options.projectId,
            collection: collection
          }).render();

        } else if (!comment.topic && comment.parentId === null) {

          // console.log("Comment's with no parents");
          self.independentComment = new CommentItemView({
            el: ".comment-list-wrapper",
            model: comment
          });

        }

      });

      this.initializeCommentUIAdditions();
    },

    initializeCommentUIAdditions: function () {
      popoverPeopleInit(".comment-user-link");
    },

    toggleTopic: function (e) {
      if (e.preventDefault()) e.preventDefault();
      // The next() is the adjacent DOM element, and that will always be
      // the list of comments that directly follows the topic (not child-literal of topic though).
      $(e.currentTarget).next().slideToggle();
    },

    reply: function (e) {
      // TBD.
    },

    cleanup: function () {
      this.remove();
      this.undelegateEvents()
    }

  });

  return Application.Controller.Comment;
});

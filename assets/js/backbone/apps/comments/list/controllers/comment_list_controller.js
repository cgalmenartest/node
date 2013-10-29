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

  var popovers = new Popovers();

  Application.Controller.Comment = Backbone.View.extend({

    el: ".comment-list-wrapper",

    events: {
      "click .new-topic"              : "newTopic",
      "click .reply-to"               : "reply",
      "click [data-topic='true']"     : "toggleTopic",
      "mouseenter .comment-user-link" : popovers.popoverPeopleOn
    },

    initialize: function () {
      var self = this;

      this.initializeCommentCollection();
      this.initializeListeners();

      // Populating the DOM after a comment was created.
      this.listenToOnce(this.commentCollection, "comment:save:success", function (modelJson, currentTarget) {
        self.addNewCommentToDom(modelJson, currentTarget);
      });

    },

    initializeCommentCollection: function () {
      var self = this;

      if (this.commentCollection) { this.commentCollection; }
      else { this.commentCollection = new CommentCollection(); }

      this.commentCollection.fetch({
        url: '/api/comment/findAllByProjectId/' + this.options.projectId,
        success: function (collection) {
          self.collection = collection;
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
          url: '/api/comment',
          type: 'POST',
          contentType: 'application/json',
          processData: false,
          data: JSON.stringify(data)
        }).done(function (result) {
          self.commentCollection.fetch({
            url: '/api/comment/findAllByProjectId/' + self.options.projectId,
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
        if (comment.topic === true && comment.comments) {
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
      popovers.popoverPeopleInit(".comment-user-link");
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

    newTopic: function (e) {
      if (e.preventDefault()) e.preventDefault();

      self.topicForm = new CommentFormView({
        el: '.comment-list-wrapper',
        projectId: this.options.projectId,
        collection: this.collection,
        topic: true
      });
    },

    addNewCommentToDom: function (modelJson, currentTarget) {
      modelJson['user'] = window.cache.currentUser;

      if (self.comment) self.comment.cleanup();
      self.comment = new CommentItemView({
        el: $(currentTarget).parent(),
        model: modelJson
      }).render();

      // Clear out the current div
      $(currentTarget).find("div[contentEditable=true]").text("");
    },

    cleanup: function () {
      this.remove();
      this.undelegateEvents()
    }

  });

  return Application.Controller.Comment;
});

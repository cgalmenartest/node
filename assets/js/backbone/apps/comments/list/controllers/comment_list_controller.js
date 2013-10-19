define([
  'jquery',
  'underscore',
  'backbone',
  'popovers',
  'comment_collection',
  'comment_list_view',
  'comment_form_view',
  'comment_item_view',
  'comment_form_view'
], function ($, _, Backbone, Popovers, CommentCollection, CommentListView, CommentFormView, CommentItemView, CommentFormView) {

  var popovers = new Popovers();

  Application.Controller.Comment = Backbone.View.extend({

    el: ".comment-list-wrapper",

    events: {
      "click .new-topic"                  : "newTopic",
      "click [data-topic='true']"         : "toggleTopic",
      "mouseenter .comment-user-link"     : popovers.popoverPeopleOn,
      "mouseleave .comment-user-link"     : popovers.popoverPeopleOff,
      "click a[href='#reply-to-comment']" : "reply"
    },

    initialize: function () {
      var self = this;

      this.initializeCommentCollection();
      this.initializeListeners();

      // Populating the DOM after a comment was created.
      this.listenTo(this.commentCollection, "comment:save:success", function (model, modelJson, currentTarget) {
        self.addNewCommentToDom(modelJson, currentTarget);
      });

    },

    initializeCommentCollection: function () {
      var self = this;

      if (this.commentCollection) { this.renderView() }
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

      var data = {
        comments: collection.toJSON()[0].comments
      }

      var depth = {};
      for (var i = 0; i < data.comments.length; i += 1) {
        if (data.comments[i].topic === true) {
          depth[data.comments[i].id] = 0;
          data.comments[i]['depth'] = depth[data.comments[i].id];
        } else {
          depth[data.comments[i].id] = depth[data.comments[i].parentId] + 1;
          data.comments[i]['depth'] = depth[data.comments[i].id];
        }
      }

      _.each(data.comments, function (comment) {

        // Render the topic view and then in that view spew out all of its children.
        // console.log("Comment's with children:");
        if (comment.topic) {
          self.comment = new CommentItemView({
            el: "#comment-list-null",
            model: comment,
            projectId: self.options.projectId,
            collection: collection
          }).render();
        } else {
          self.comment = new CommentItemView({
            el: "#comment-list-" + comment.parentId,
            model: comment,
            projectId: self.options.projectId,
            collection: collection
          }).render();

          if (comment.depth <= 1) {
            // Place the commentForm at the bottom of the list of comments for that topic.
            self.commentForm = new CommentFormView({
              el: '#comment-form-' + comment.id,
              projectId: comment.projectId,
              parentId: comment.id,
              collection: self.collection
            });
          } else {

          }
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
      if (e.preventDefault()) e.preventDefault();
      // The comment form is adjacent, not a child of the current target.
      if ($("." + e.currentTarget.className + " ~ .comment-form").attr("data-clicked") === "true") {
        $("." + e.currentTarget.className + " ~ .comment-form").addClass("hidden").attr("data-clicked", false);
      } else {
        $("." + e.currentTarget.className + " ~ .comment-form").removeClass("hidden").attr("data-clicked", true);
      }
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

      if (modelJson.depth === undefined) {
        modelJson['depth'] += parseInt($(currentTarget).parent().prev().prev().attr("data-depth"));
      }

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

define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'jquery_timeago',
  'popovers',
  'comment_collection',
  'comment_form_view',
  'comment_item_view',
  'text!comment_wrapper_template'
], function ($, _, Backbone, utils, TimeAgo, Popovers, CommentCollection, CommentFormView, CommentItemView, CommentWrapper) {

  var popovers = new Popovers();

  Application.Controller.Comment = Backbone.View.extend({

    el: ".comment-list-wrapper",

    events: {
      "click .new-topic"                  : "newTopic",
      "click .comment-expand"             : "topicExpand",
      "click .comment-contract"           : "topicContract",
      "mouseenter .comment-user-link"     : popovers.popoverPeopleOn,
      "click .comment-user-link"          : popovers.popoverClick,
      "click .link-backbone"              : linkBackbone,
      "click a[href='#reply-to-comment']" : "reply"
    },

    initialize: function (options) {
      var self = this;
      this.options = options;

      this.initializeRender();
      this.initializeCommentCollection();
      this.initializeListeners();

      // Populating the DOM after a comment was created.
      this.listenTo(this.commentCollection, "comment:save:success", function (model, modelJson, currentTarget) {
        self.addNewCommentToDom(modelJson, currentTarget);
      });

    },

    initializeRender: function() {
      var template = _.template(CommentWrapper, { user: window.cache.currentUser });
      this.$el.html(template);
    },

    initializeCommentCollection: function () {
      var self = this;

      if (this.commentCollection) { this.renderView() }
      else { this.commentCollection = new CommentCollection(); }

      this.commentCollection.fetch({
        url: '/api/comment/findAllBy' + this.options.target + 'Id/' + this.options.id,
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
          value: value,
          topic: true
        };
        data[self.options.target + 'Id'] = self.options.id;

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
            url: '/api/comment/findAllBy' + self.options.target + 'Id/' + self.options.id,
            success: function (collection) {
            }
          });
        });
      });
    },

    renderView: function (collection) {
      var self = this;
      this.parentMap = {};
      this.topics = [];
      var data = {
        comments: collection.toJSON()[0].comments
      };

      // compute the depth of each comment to use as metadata when rendering
      // in the process, create a map of the ids of each comment's children
      var depth = {};
      if (!data.comments) {
        data.comments = [];
      }
      for (var i = 0; i < data.comments.length; i += 1) {
        if (data.comments[i].topic === true) {
          depth[data.comments[i].id] = 0;
          data.comments[i]['depth'] = depth[data.comments[i].id];
          this.topics.push(data);
        } else {
          depth[data.comments[i].id] = depth[data.comments[i].parentId] + 1;
          data.comments[i]['depth'] = depth[data.comments[i].id];
          // augment the parentMap with this comment
          if (_.isUndefined(this.parentMap[data.comments[i].parentId])) {
            this.parentMap[data.comments[i].parentId] = [];
          }
          this.parentMap[data.comments[i].parentId].push(data.comments[i].id);
        }
      }

      // hide the loading spinner
      this.$('.comment-spinner').hide();

      this.commentViews = [];
      this.commentForms = [];
      if (data.comments.length == 0) {
        this.$('#comment-empty').show();
      }
      _.each(data.comments, function (comment, i) {
        self.renderComment(self, comment, collection, self.parentMap);
      });

      this.initializeCommentUIAdditions();
    },

    renderComment: function (self, comment, collection, map) {
      var self = this;
      // count the number of replies in a topic, recursively
      var countChildren = function (map, comment) {
        if (_.isUndefined(map[comment])) {
          return 0;
        }
        var count = map[comment].length;
        _.each(map[comment], function (c) {
          count += countChildren(map, c);
        });
        return count;
      };
      // if this is a topic, count the children for rendering
      if (comment.topic === true) {
        comment.numChildren = countChildren(map, comment.id);
      }
      // Render the topic view and then in that view spew out all of its children.
      var commentIV = new CommentItemView({
        el: "#comment-list-" + (comment.topic ? 'null' : comment.parentId),
        model: comment,
        target: this.options.target,
        projectId: comment.projectId,
        taskId: comment.taskId,
        collection: collection
      }).render();
      self.commentViews.push(commentIV);
      if (comment.depth <= 1) {
        // Place the commentForm at the bottom of the list of comments for that topic.
        var commentFV = new CommentFormView({
          el: '#comment-form-' + comment.id,
          target: this.options.target,
          projectId: comment.projectId,
          taskId: comment.taskId,
          parentId: comment.id,
          collection: collection,
          depth: comment['depth']
        });
        self.commentForms.push(commentFV);
      }
      return $("#comment-list-" + (comment.topic ? 'null' : comment.parentId));
    },

    initializeCommentUIAdditions: function ($comment) {
      if (_.isUndefined($comment)) {
        this.$("time.timeago").timeago();
      } else {
        $comment.find("time.timeago").timeago();
      }
      popovers.popoverPeopleInit(".comment-user-link");
      popovers.popoverPeopleInit(".project-people-div");
    },

    topicExpand: function (e) {
      if (e.preventDefault) e.preventDefault();
      // toggle all the sublists
      var target = $($(e.currentTarget).parents('li')[0])
      $(e.currentTarget).hide();
      $(target.find('.comment-contract')[0]).show();
      $(target.children('.comment-sublist-wrapper')[0]).slideToggle();
    },

    topicContract: function (e) {
      if (e.preventDefault) e.preventDefault();
      // toggle all the sublists
      var target = $($(e.currentTarget).parents('li')[0])
      $(e.currentTarget).hide();
      $(target.find('.comment-expand')[0]).show();
      $(target.children('.comment-sublist-wrapper')[0]).slideToggle();
    },

    reply: function (e) {
      if (e.preventDefault) e.preventDefault();
      // The comment form is adjacent, not a child of the current target.
      // so find the li container, and then the form inside
      var target = $($($(e.currentTarget).parents('li.comment-item')[0]).children('.comment-form')[0]);
      if (target.data('clicked') == 'true') {
        target.hide();
        target.data('clicked', 'false');
      } else {
        target.show();
        target.data('clicked', 'true');
      }
    },

    newTopic: function (e) {
      if (e.preventDefault) e.preventDefault();

      if (this.topicForm) this.topicForm.cleanup();
      var options = {
        el: '.topic-form-wrapper',
        target: this.options.target,
        collection: this.collection,
        topic: true,
        depth: -1
      }
      options[this.options.target + 'Id'] = this.options.id;
      this.topicForm = new CommentFormView(options);
    },

    addNewCommentToDom: function (modelJson, currentTarget) {
      var self = this;
      modelJson['user'] = window.cache.currentUser;
      // increment the comment counter
      if ($(currentTarget).data('depth') >= 0) {
        var itemContainer = $(currentTarget).parents('.comment-item.border-left')[0];
        var countSpan = $(itemContainer).find('.comment-count-num')[0];
        $(countSpan).html(parseInt($(countSpan).text()) + 1);
      }
      // set the depth based on the position in the tree
      modelJson['depth'] = $(currentTarget).data('depth') + 1;
      // update the parentMap for sorting
      if (!_.isNull(modelJson.parentId)) {
        if (_.isUndefined(this.parentMap[modelJson.parentId])) {
          this.parentMap[modelJson.parentId] = [];
        }
        this.parentMap[modelJson.parentId].push(modelJson.id);
      } else {
        this.topics.push(modelJson);
      }
      // hide the empty placeholder, just in case it is still showing
      $("#comment-empty").hide();
      // render comment and UI addons
      var $comment = self.renderComment(self, modelJson, self.collection, self.parentMap);
      self.initializeCommentUIAdditions($comment);

      // Clear out the current div
      $(currentTarget).find("div[contentEditable=true]").text("");
    },

    cleanup: function () {
      for (var i in this.commentForms.reverse()) {
        if (this.commentForms[i]) { this.commentForms[i].cleanup(); }
      }
      for (var i in this.commentViews.reverse()) {
        if (this.commentViews[i]) { this.commentViews[i].cleanup(); }
      }
      if (this.topicForm) {
        this.topicForm.cleanup();
      }
      removeView(this);
    }

  });

  return Application.Controller.Comment;
});

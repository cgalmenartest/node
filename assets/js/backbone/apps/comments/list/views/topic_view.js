define([
  'jquery',
  'underscore',
  'backbone',
  'jquery_timeago',
  'text!topic_template',
  'comment_item_view',
  'comment_form_view',
  'utilities'
], function ($, _, Backbone, TimeAgo, TopicTemplate, CommentItemView, CommentFormView, utilities) {

  var TopicView = Backbone.View.extend({

    render: function () {
      // Clean string out from undefineds in the marshalling process.
      cleanStringFromUndefined(this.model, this.model.value, "||")

      var data = { topic: this.model },
          compiledTemplate = _.template(TopicTemplate, data);

      this.$el.append(compiledTemplate);

      this.iterateThroughCommentsForTopicAndRenderWithinParent();

      $("time.timeago").timeago();

      return this;
    },

    iterateThroughCommentsForTopicAndRenderWithinParent: function () {
      var self = this;

      _.each(this.model.comments, function (comment) {
        if (self.comment) self.comment.cleanup()

        self.comment = new CommentItemView({
          // this is set to the current topic.  We are building a list of comments underneath of.
          el: ".comment-list-" + self.model.id,
          model: comment
        }).render();

      });

      // Place the commentForm at the bottom of the list of comments for that topic.
      self.commentForm = new CommentFormView({
        el: '.comment-list-' + self.model.id,
        projectId: self.options.projectId,
        parentId: self.model.id,
        collection: self.options.collection
      });

    },

    cleanup: function () {
      $(this.el).children().remove();
    }

  });

  return TopicView;
})
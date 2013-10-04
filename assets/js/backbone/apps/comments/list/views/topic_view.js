define([
  'underscore',
  'backbone',
  'text!topic_template',
  'comment_item_view',
  'comment_form_view'
], function (_, Backbone, TopicTemplate, CommentItemView, CommentFormView) {

  var TopicView = Backbone.View.extend({

    render: function () {
      var data = { topic: this.model },
          compiledTemplate = _.template(TopicTemplate, data);

      this.$el.append(compiledTemplate);

      this.iterateThroughCommentsForTopicAndRenderWithinParent();

      return this;
    },

    iterateThroughCommentsForTopicAndRenderWithinParent: function () {
      var self = this;

      _.each(this.model.comments, function (comment) {
        if (self.comment) self.comment.cleanup()

        self.comment = new CommentItemView({
          // this is set to the current topic we are building a list of comments underneath of.
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
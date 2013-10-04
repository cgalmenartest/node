define([
  'underscore',
  'backbone',
  'text!comment_item_template'
], function (_, Backbone, CommentItemTemplate) {

  var CommentItemView = Backbone.View.extend({

    render: function () {
      var comment = {
        comment: this.model
      }

      var compiledTemplate = _.template(CommentItemTemplate, comment)
      this.$el.append(compiledTemplate)
    },

    cleanup: function () {
      $(this.el).children().remove()
    }

  });

  return CommentItemView;
})
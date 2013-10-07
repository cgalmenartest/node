define([
  'underscore',
  'backbone',
  'text!comment_item_template',
  'utilities'
], function (_, Backbone, CommentItemTemplate, utilities) {

  var CommentItemView = Backbone.View.extend({

    render: function () {
      // Clean string out from undefineds in the marshalling process.
      cleanStringFromUndefined(this.model, this.model.value, "||")

      var data = { comment: this.model },
          compiledTemplate = _.template(CommentItemTemplate, data);

      this.$el.append(compiledTemplate);
    },

    cleanup: function () {
      $(this.el).children().remove();
    }

  });

  return CommentItemView;
})
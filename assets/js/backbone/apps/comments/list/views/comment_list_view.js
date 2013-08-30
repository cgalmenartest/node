define([
  'jquery',
  'underscore',
  'backbone',
  'text!comment_list_template'
], function ($, _, Backbone, CommentListTemplate) {

  var CommentListView = Backbone.View.extend({

    template: _.template(CommentListTemplate),

    render: function () {
      var compiledTemplate = this.template(this.collection.toJSON()[0]);
      this.$el.html(compiledTemplate);
    }

  });

  return CommentListView;
});
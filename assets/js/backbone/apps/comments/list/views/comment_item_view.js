define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'autolinker',
  'text!comment_item_template',
], function ($, _, Backbone, utilities, Autolinker, CommentItemTemplate) {

  var CommentItemView = Backbone.View.extend({

    render: function () {
      this.model.currentUser = window.cache.currentUser;
      this.model.valueHtml = Autolinker.link(this.model.value);
      if (this.model.topic) {
        var compiledTemplate = _.template(CommentItemTemplate, this.model);
        this.$el.append(compiledTemplate);
      } else {
        var self = this;
        if (this.model.parentId === parseInt($("#comment-list-" + this.model.parentId).attr("id").split("-")[$("#comment-list-"+this.model.parentId).attr("id").split("-").length - 1])) {
          var newTemplate = _.template(CommentItemTemplate, this.model);
          $("#comment-list-" + this.model.parentId).append(newTemplate);
        }
      }
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return CommentItemView;
})
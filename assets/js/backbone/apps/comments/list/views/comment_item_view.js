define([
  'jquery',
  'underscore',
  'backbone',
  'jquery_timeago',
  'text!comment_item_template',
  'utilities',
  'text!comment_list_template'
], function ($, _, Backbone, TimeAgo, CommentItemTemplate, utilities, CommentListTemplate) {

  var CommentItemView = Backbone.View.extend({

    render: function () {
      // Clean string out from undefineds in the marshalling process.
      cleanStringFromUndefined(this.model, this.model.value, "||");

      // Buggy, refactor:
      // if (this.model.value.indexOf('||') != -1) {
      //   data['comment']['link'] = this.model.value.split('||')[1];
      //   data['comment']['value'] = this.model.value.split('||')[0];
      // }

      if (this.model.topic) {
        compiledTemplate = _.template(CommentItemTemplate, this.model);
        this.$el.append(compiledTemplate);
      } else {
        var self = this;
        if (this.model.parentId === parseInt($("#comment-list-" + this.model.parentId).attr("id").split("-")[$("#comment-list-"+this.model.parentId).attr("id").split("-").length - 1])) {
          newTemplate = _.template(CommentItemTemplate, this.model);
          $("#comment-list-" + this.model.parentId).append(newTemplate);
        }
      }

      $("time.timeago").timeago();
    },

    cleanup: function () {
      $(this.el).children().remove();
    }

  });

  return CommentItemView;
})
define([
  'jquery',
  'underscore',
  'backbone',
  'comment_collection',
  'text!comment_form_template'
], function ($, _, Backbone, CommentCollection, CommentFormTemplate) {
  'use strict'; 

  var CommentFormView = Backbone.View.extend({

    el: ".comment-form-wrapper",

    events: {
      "submit #comment-form": "post",
      "click #comment": "add"
    },

    initialize: function (options) {
      this.options = options;
      this.render();
    },

    render: function () {
      var data      = {},
          template  = _.template(CommentFormTemplate, data);

      this.$el.html(template);
      
      return this;
    },

    post: function (e) {
      if (e.preventDefault()) e.preventDefault();

      if ($(e.currentTarget).find(".comment-content").val() !== "") {
        this.comment = $(e.currentTarget).find(".comment-content").text();
      } else {
        this.comment = $(".comment-content:first-child").text();
      }

      if ($(".comment-content:first-child").children("a").attr("href") !== undefined) this.WikiLink = _.escape($(".comment-content:first-child").children("a").attr("href"))

      var projectId   = this.options.projectId,
          parentId;

      if (this.options) {
        parentId = parseInt(this.options.parentId);
      }

      var data = {
        projectId: projectId,
        parentId: parentId,
        comment: this.comment,
        wikiLink: this.WikiLink
      }

      this.collection.trigger("comment:save", data);
    },

    cleanup: function () {
      $(this.el).remove()
    }

  });

  return CommentFormView;
})
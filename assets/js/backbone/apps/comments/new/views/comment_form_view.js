define([
  'jquery',
  'underscore',
  'backbone',
  'comment_collection',
  'text!comment_form_template',
  'comment_list_view'
], function ($, _, Backbone, CommentCollection, CommentFormTemplate, CommentListView) {
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

      if ($(".comment-content:first-child").children("a").attr("href") !== undefined)
        this.wikiLink = _.escape($(".comment-content:first-child").children("a").attr("href"))

      var projectId   = this.options.projectId,
          parentId;

      if (this.options) {
        parentId = parseInt(this.options.parentId);
      }

      var data = {
        projectId: projectId,
        parentId: parentId,
        comment: this.comment + "||" + this.wikiLink
      }
      var self = this
      this.collection.trigger("comment:save", data);
      this.listenToOnce(this.collection, "comment:save:success", function () {
          self.collection.fetch({
          url: '/comment/findAllByProjectId/' + self.options.projectId,
          success: function (collection) {
            self.commentListView = new CommentListView({
              el: ".comment-list-wrapper",
              collection: collection
            }).render();
          }
        })
      })
    },

    cleanup: function () {
      $(this.el).remove()
    }

  });

  return CommentFormView;
})
// This is the comment, and topic form.
// We know what to do based on a flag being passed into this view
// via the controller.  That flag is:
// this.options.topic = true

define([
  'jquery',
  'underscore',
  'backbone',
  'comment_collection',
  'text!comment_form_template',
  'comment_list_view'
], function ($, _, Backbone, CommentCollection, CommentFormTemplate, CommentListView) {

  var CommentFormView = Backbone.View.extend({

    // el: ".comment-form-wrapper",

    events: {
      "submit #comment-form": "post",
      "click #comment": "add"
    },

    initialize: function (options) {
      this.options = options;
      this.render();
    },

    render: function () {
      var data = { form: this.options },
          template  = _.template(CommentFormTemplate, data);

      if (this.options.topic) {
        this.$el.prepend(template).append("<div class='clearfix'></div>");
      } else {
        this.$el.append(template)
      }

      return this;
    },

    post: function (e) {
      if (e.preventDefault()) e.preventDefault();

      if ($(e.currentTarget).find(".comment-content").val() !== "") {
        this.comment = $(e.currentTarget).find(".comment-content").text();
      } else {
        this.comment = $(e.currentTarget).find(".comment-content:first-child").text();
      }

      if ($(e.currentTarget).find(".comment-content:first-child").children("a").attr("href") !== undefined)
        this.wikiLink = _.escape($(e.currentTarget).find(".comment-content:first-child").children("a").attr("href"))

      var projectId   = this.options.projectId,
          parentId;

      if (this.options.parentId) {
        parentId = parseInt(this.options.parentId);
      }

      var data;

      if (this.options.topic) {
        data = {
          projectId : projectId,
          comment   : this.comment + "||" + this.wikiLink,
          topic     : true
        }
      } else {
        data = {
          projectId : projectId,
          parentId  : parentId,
          comment   : this.comment + "||" + this.wikiLink,
          topic     : false
        }
      }

      var self = this
      this.collection.trigger("comment:save", data);
      this.listenToOnce(this.collection, "comment:save:success", function () {
          // self.comment = new CommentItemView({
          //   el: ".comment",
          //   comment: data.comment
          // }).render();
        })
    },

    cleanup: function () {
      $(this.el).remove()
    }

  });

  return CommentFormView;
})
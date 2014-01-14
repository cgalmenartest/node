// This is the comment, and topic form.
// We know what to do based on a flag being passed into this view
// via the controller.  That flag is:
// this.options.topic = true

define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'comment_collection',
  'text!comment_form_template'
], function ($, _, Backbone, utils, CommentCollection, CommentFormTemplate) {

  var CommentFormView = Backbone.View.extend({

    events: {
      "submit .comment-submit": "post"
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
      if (e.preventDefault) e.preventDefault();

      if ($(e.currentTarget).find(".comment-content").val() !== "") {
        this.comment = $(e.currentTarget).find(".comment-content").text();
      } else {
        this.comment = $(e.currentTarget).find(".comment-content:first-child").text();
      }

      // abort if the comment is empty
      if (!this.comment) {
        this.$('.comment-alert-empty').show();
        return;
      }

      if ($(e.currentTarget).find(".comment-content:first-child").children("a").attr("href") !== undefined)
        this.wikiLink = _.escape($(e.currentTarget).find(".comment-content:first-child").children("a").attr("href"))

      var parentId;

      if (this.options.parentId) {
        parentId = parseInt(this.options.parentId);
      }

      var data = {
        comment   : this.comment,
        topic     : false
      };
      data[this.options.target + 'Id'] = this.options[this.options.target + 'Id'];

      if (this.options.topic) {
        data.topic = true;
      } else {
        data.parentId = parentId;
      }
      this.$('.comment-alert-empty').hide();

      var currentTarget = e.currentTarget;
      this.collection.trigger("comment:save", data, currentTarget);

      if (this.options.topic) {
        this.$el.hide();
      }
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return CommentFormView;
})
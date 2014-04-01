// This is the comment, and topic form.
// We know what to do based on a flag being passed into this view
// via the controller.  That flag is:
// this.options.topic = true

define([
  'jquery',
  'underscore',
  'backbone',
  'jquery.caret',
  'jquery.at',
  'utilities',
  'comment_collection',
  'text!comment_form_template',
  'text!comment_ac_template',
  'text!comment_inline_template'
], function ($, _, Backbone, jqCaret, jqAt, utils, CommentCollection, CommentFormTemplate, CommentAcTemplate, CommentInlineTemplate) {

  var CommentFormView = Backbone.View.extend({

    events: {
      "submit .comment-submit": "post"
    },

    initialize: function (options) {
      this.options = options;
      this.render();
    },

    render: function () {
      var data = { form: this.options };
      var template = _.template(CommentFormTemplate, data);

      if (this.options.topic) {
        this.$el.prepend(template).append("<div class='clearfix'></div>");
      } else {
        this.$el.append(template);
      }

      this.$(".comment-input").atwho({
        at: '@',
        search_key: 'value',
        tpl: CommentAcTemplate,
        insert_tpl: CommentInlineTemplate,
        callbacks: {
          tpl_eval: _.template,
          remote_filter: function(query, callback) {
            $.getJSON("/api/ac/inline", { q: query }, function (data) {
              callback(data);
            });
          }
        }
      });

      return this;
    },

    post: function (e) {
      if (e.preventDefault) e.preventDefault();

      var commentHtml = this.$(".comment-input").html();
      var commentText = this.$(".comment-input").text().trim();

      // abort if the comment is empty
      if (!commentText) {
        this.$('.comment-alert-empty').show();
        return;
      }

      var parentId;

      if (this.options.parentId) {
        parentId = parseInt(this.options.parentId);
      }

      var data = {
        comment   : commentHtml,
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
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
      var self = this;
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
        limit: 10,
        callbacks: {
          tpl_eval: _.template,
          sorter: function (query, items, search_key) {
            // don't sort, use the order from the server
            return items;
          },
          highlighter: function (li, query) {
            var regexp;
            if (!query) {
              return li;
            }
            // just want to find all case insensitive matches and replace with <strong>
            // set up the query as a regular expression
            var re = new RegExp('(' + query.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1") + ')', 'ig');
            // parse the li string into a DOM node
            var liDom = $.parseHTML(li);
            var text = $(liDom[0]).text().replace(re, "<strong>$1</strong>");
            $(liDom[0]).html(text);
            return liDom[0];
          },
          remote_filter: function (query, callback) {
            // get data from the server
            $.getJSON("/api/ac/inline", { q: query }, function (data) {
              _.each(data, function (d) {
                // At.js expects the name to be set for the matcher fn
                if (_.isUndefined(d.name)) {
                  d.name = d.value;
                }
              });
              callback(data);
            });
          }
        }
      }).on("inserted.atwho", function(event, $li) {
        // This is a hack to hide the space after inserting an element.
        var ids = self.$("span.atwho-view-flag > span:visible");
        _.each(ids, function (id) {
          // insert a non-breaking space after the inserted element, but not within it
          // TODO:
          console.log($(id));
          console.log($(id).parent());
        });
        ids.hide();
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
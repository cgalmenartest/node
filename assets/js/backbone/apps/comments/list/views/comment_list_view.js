define([
  'jquery',
  'underscore',
  'jquery_timeago',
  'backbone',
  'text!comment_list_template',
  'text!comment_item_template',
  'text!comment_wrapper_template',
  'popovers'
], function ($, _, TimeAgo, Backbone, CommentListTemplate, CommentItemTemplate, CommentWrapperTemplate, Popovers) {

  var CommentListView = Backbone.View.extend({

    events: {
      'click #project-topic-new': 'showTopicForm',
      'submit #comment-topic-form': 'newTopic'
    },

    template: _.template(CommentListTemplate),

    showTopicForm: function() {
      $('.project-topic-form').show();
    },

    newTopic: function(e) {
      if (e.preventDefault()) e.preventDefault();
      var value;
      if ($(e.currentTarget).find(".comment-content").val() !== "") {
        value = $(e.currentTarget).find(".comment-content").text();
      } else {
        value = $(e.currentTarget).find(".comment-content:first-child").text();
      }
      this.collection.trigger('comment:topic:new', value);
    },

    render: function () {
      // var i,
      //     value,
      //     wikiLink,
      //     comments    = this.collection.toJSON()[0].comments
      //     collection  = this.collection.toJSON()[0];

      // for (i in comments) {
      //   value     = comments[i].value.split("||")[0];
      //   wikiLink  = comments[i].value.split("||")[1];

      //   comments[i]['value'] = value;
      //   comments[i]['wikiLink'] = wikiLink;
      //   for (j in comments[i].comments) {
      //     value     = comments[i].comments[j].value.split("||")[0];
      //     wikiLink  = comments[i].comments[j].value.split("||")[1];

      //     comments[i].comments[j]['value'] = value;
      //     comments[i].comments[j]['wikiLink'] = wikiLink;
      //   }
      // }

      // var compiledTemplate = this.template(collection);
      // this.$el.html(compiledTemplate);

      // var itemTemplate =  _.template(CommentItemTemplate);
      // var wrapperTemplate = _.template(CommentWrapperTemplate);

      // var renderComment = function(comment) {
      //   if (comment.topic) {
      //     var wrapper = wrapperTemplate({ comment: comment });
      //     $(".project-comments").append(wrapper);
      //   }

      //   var parent = comment.parentId;
      //   if (!parent) { parent = comment.id; }
      //   var item = itemTemplate({ comment: comment });
      //   $("#comment-list-" + parent).append(item);

      //   if (comment.comments) {
      //     for (i in comment.comments) {
      //       renderComment(comment.comments[i]);
      //     }
      //   }
      // }

      // for (i in comments) {
      //   renderComment(comments[i]);
      // }

      $("time.timeago").timeago();
      popoverPeopleInit(".project-people-div");
    }

  });

  return CommentListView;
});
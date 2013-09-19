define([
  'jquery',
  'underscore',
  'jquery_timeago',
  'backbone',
  'text!comment_list_template'
], function ($, _, TimeAgo, Backbone, CommentListTemplate) {

  var CommentListView = Backbone.View.extend({

    template: _.template(CommentListTemplate),

    render: function () {
      var i,
          value,
          wikiLink,
          comments    = this.collection.toJSON()[0].comments
          collection  = this.collection.toJSON()[0]

      for (i in comments) {
        value     = comments[i].value.split("||")[0]
        wikiLink  = comments[i].value.split("||")[1]

        comments[i]['value'] = value
        comments[i]['wikiLink'] = wikiLink
      }

      var compiledTemplate = this.template(collection);
      this.$el.html(compiledTemplate);

      $("time.timeago").timeago();
    }

  });

  return CommentListView;
});
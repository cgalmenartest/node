define([
  'underscore',
  'backbone',
  'comment_model'
], function (_, Backbone, CommentModel) {

  var CommentCollection = Backbone.Collection.extend({

    model: CommentModel

  });

  return CommentCollection;
})
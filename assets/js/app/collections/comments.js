define([
  'underscore',
  'backbone',
  '../models/comment',
  '../views/comments/list'
], function (_, Backbone, CommentModel, CommentListView) {
  'use strict';

  var CommentsCollection = Backbone.Collection.extend({
    
    model: CommentModel,
    
    initialize: function (projectObject) {
      // Instance variable with the ID for the parent project.
      this.id = projectObject.id;
    },

    url: function () {
      return '/comment/findAllByProject?projectId=' + this.id;
    },

    parse: function (response) {
      new CommentListView({ comments: response.comments }).render();
    }

  });

  return CommentsCollection;
});
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
      this.id = projectObject.id;
      this.initializeSaveListeners();
    },

    url: function () {
      return '/comment/findAllByProjectId/' + this.id;
    },

    initializeSaveListeners: function () {
      var _this = this;
      
      app.events.on("nestedCommentSave:success", function () {
        _this.fetch();
        app.events.trigger("comment:render");
      });

      app.events.on("commentSave:success", function () {
        _this.fetch();
        app.events.trigger("comment:render");
      })
    },

    parse: function (response) {
      new CommentListView({ comments: response.comments });      
    }

  });

  return CommentsCollection;
});
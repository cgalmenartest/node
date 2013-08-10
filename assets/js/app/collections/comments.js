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

      var _this = this;
      app.events.on("commentSave:success", function () {
        // This fetch calls the parse method automatically.
        // So all we do here is wait for the save of a comment
        // parse, and render.
        app.events.trigger("comment:render");
        _this.fetch();
      })
    },

    url: function () {
      return '/comment/findAllByProjectId/' + this.id
    },

    parse: function (response) {
      new CommentListView({ comments: response.comments });

      // _.each(response.comments, function(comment) { 
      //   for (var i in comment) {
      //     if comment['parentId'])
      //   }
      // })
      
    }

  });

  return CommentsCollection;
});
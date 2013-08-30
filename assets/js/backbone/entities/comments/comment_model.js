define([
  'underscore',
  'backbone'
], function (_, Backbone) {
  'use strict';

  var CommentModel = Backbone.Model.extend({

    urlRoot: '/comment',

    initialize: function () {
      this.saveComment();
    },

    saveComment: function () {
      var self = this;

      this.listenTo(this, 'comment:save', function (parentId, comment, projectId) {
        self.save({
          parentId  : parentId,
          value     : comment,
          projectId : projectId
        }, {
          success: function (data) {
            self.trigger("comment:save:success");
          }
        })
      })
    }

  });

  return CommentModel;
});
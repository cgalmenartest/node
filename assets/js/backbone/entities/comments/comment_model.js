var _ = require('underscore');
var Backbone = require('backbone');


var CommentModel = Backbone.Model.extend({

  urlRoot: '/api/comment',

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

module.exports = CommentModel;

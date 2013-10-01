define([
  'underscore',
  'backbone',
  'comment_model',
  'comment_list_controller'
], function (_, Backbone, CommentModel, CommentListContro) {

  var CommentCollection = Backbone.Collection.extend({

    model: CommentModel,

    initialize: function () {
      var self = this;

      this.listenTo(this, "comment:save", function (data) {
        self.addAndSave(data);
      });

    },

    addAndSave: function (data) {
      var self = this, comment;

      comment = new CommentModel({ 
        parentId  : data['parentId'],
        value     : data['comment'],
        projectId : data['projectId']
      })
      
      self.add(comment);

      self.models.forEach(function (model) {
        model.save();
      });

      self.trigger("comment:save:success");
    }
  });

  return CommentCollection;
})
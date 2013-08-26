define([
  'underscore',
  'backbone',
  'task_model'
], function (_, Backbone, TaskModel) {
  'use strict';

  var TasksCollection = Backbone.Collection.extend({
    
    model: TaskModel,
    
    parse: function (response) {
      return response.tasks;
    },

    url: '/task', 

    initialize: function () {
      this.initializeGetListeners();
      this.initializeSaveListeners();
    },

    initializeGetListeners: function () {
      var self = this;

      entities.request.on("tasks:fetch", function (projectId) {
        self.fetch({
          url: '/task/findAllByProject/' + projectId,
          success: function (data) {
            entities.request.trigger("tasks:fetch:success", data);
          }
        });
      });
    },

    initializeSaveListeners: function () {
      var self = this;

      this.listenTo(this, "task:save", function (title, projectId, description) {
        self.task = new TaskModel({ title: title, projectId: projectId, description: description });

        self.add(self.task);
        self.models.forEach(function (_model) {
          _model.save();
        });

        entities.request.trigger("tasks:fetch", projectId);
      });
    }
    
  });

  return TasksCollection;
});
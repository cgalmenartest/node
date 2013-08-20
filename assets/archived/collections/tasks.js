define([
  'underscore',
  'backbone',
  '../models/task',
  '../views/tasks/list'
], function (_, Backbone, TaskModel, TaskListView) {
  'use strict';

  var TasksCollection = Backbone.Collection.extend({
    
    model: TaskModel,
    
    initialize: function (projectObject) {
      this.id = projectObject.id;
      this.initializeSaveListeners(); 
    },

    initializeSaveListeners: function () {
      var _this = this;

      app.events.on("taskSave:success", function () {
        _this.fetch();
        app.events.trigger("task:render");
      })
    },

    url: function () {
      return '/task/findAllByProject/' + this.id;
    },

    parse: function (response) {
      new TaskListView({ tasks: response.tasks });
    }
    
  });

  return TasksCollection;
});
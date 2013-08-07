define([
    'underscore',
    'backbone'
], function (_, Backbone) {
  'use strict';

  var TaskModel = Backbone.Model.extend({

    defaults: {
      name        : null,
      description : null
    },

    urlRoot: '/task',

    initialize: function () {
      this.initializeTaskSave();
    },

    initializeTaskSave: function () {
      var _this = this;

      this.on("task:save", function (title, projectId, description) {
        _this.save({ 
          title: title, 
          projectId: projectId, 
          description: description 
          }, { success: function (data) { 
            console.log(data) 
          }, error: function (data) { 
            console.log(data) 
          }
        });
      });
    }

  });

    return TaskModel;
});
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

    validate: function (attrs) {
      var errors = new Array();
      if (_.isEmpty(attrs.title) === true) {
        errors.push({
          type: 'form',
          attribute: 'title',
          message: 'Please enter a title'
        })
        return;
      }
    },

    initializeTaskSave: function () {
      var _this = this;

      this.on("task:save", function (title, projectId, description) {
        _this.save({ 
          title: title, 
          projectId: projectId, 
          description: description 
          }, { 
          success: function (data) { 
            app.events.trigger("taskSave:success")
          }, 
          error: function (data) { 
            console.log(data) 
          }
        });
      });
    }

  });

    return TaskModel;
});
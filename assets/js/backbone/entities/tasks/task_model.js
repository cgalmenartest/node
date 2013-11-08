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

    urlRoot: '/api/task',

    initialize: function () {
      var self = this;

      this.listenTo(this, "task:model:fetch", function (id) {
        self.get(id);
      });

      this.initializeTaskSave();
    },

    initializeTaskSave: function () {
      var self = this;

      this.listenTo(this, "task:save", function (title, projectId, description) {
        self.save({
          title: title, 
          projectId: projectId, 
          description: description 
          }, { 
          success: function (data) { 
            self.trigger("task:save:success")
          }, 
          error: function (data) { 
            console.log(data) 
          }
        });
      });
    },

    get: function (id) {
      var self = this;
      this.set({ id: id });
      this.fetch({
        success: function (data) {
          self.trigger("task:model:fetch:success", data);
        }
      });
    },

  });

    return TaskModel;
});
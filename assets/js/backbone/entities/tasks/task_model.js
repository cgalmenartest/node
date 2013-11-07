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
      this.listenTo(this, "task:save", function (data) {
        this.save();
      });

      this.listenTo(this, "task:update", function (data) {
        this.update(data);
      });
    },

    update: function (data) {
      var self = this;

      this.save(self, {
        projectId   : data['projectId'],
        title       : data['title'],
        description : data['description']
      }, {
        success: function (data) {
          console.log(data); }
      });
    }

  });

    return TaskModel;
});
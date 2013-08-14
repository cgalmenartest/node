define([
  'underscore',
  'backbone',
  '../models/project',
  '../views/projects/list'
], function (_, Backbone, ProjectModel, ProjectView) {
  'use strict';
  
  var ProjectCollection = Backbone.Collection.extend({
  
    model: ProjectModel,

    url: '/project/findAll',

    parse: function (response) {
      return response.projects;
    },

    initialize: function () {
      this.initializeSaveListeners();
    },

    initializeSaveListeners: function () {
      var _this = this;

      app.events.on("projectSave:success", function () {
        _this.fetch();
        app.events.trigger("project:render");
      });
    }
  });

  return ProjectCollection;
});
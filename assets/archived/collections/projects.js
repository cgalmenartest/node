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

      this.on("project:post", function (title, description) {
        var project = new ProjectModel({ title: title, description: description })
        _this.add(project);
        _this.models.forEach(function (_model) {
          _model.save();
        });
        app.events.trigger("projectSave:success");
      });

      app.events.on("projectSave:success", function () {
        _this.fetch();
        app.events.trigger("project:render");
      });

    },

    archived: function () {
      return this.where({ archived: true })
    }

  });

  return ProjectCollection;
});
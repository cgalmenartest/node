define([
  'underscore',
  'backbone',
  'project_model'
], function (_, Backbone, ProjectModel) {

  var ProjectsCollection = Backbone.Collection.extend({

    model: ProjectModel,

    url: '/api/project/findAll',

    parse: function (response) {
      return response.projects;
    },

    initialize: function () {
      var self = this;

      this.listenTo(this, "project:save", function (data) {
        self.addAndSave(data);
      });
    },

    addAndSave: function (data) {
      var project, self = this;

      project = new ProjectModel({
        title: data['title'],
        description: data['description']
      })

      self.add(project);

      self.models.forEach(function (model) {
        model.save();
      });

      self.trigger("project:save:success");
    }

  });

  return ProjectsCollection;
});
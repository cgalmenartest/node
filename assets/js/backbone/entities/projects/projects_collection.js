define([
  'underscore',
  'backbone',
  'project_model'
], function (_, Backbone, ProjectModel) {
  
  var ProjectsCollection = Backbone.Collection.extend({
  
    model: ProjectModel,

    url: '/project/findAll',

    parse: function (response) {
      return response.projects;
    },

    initialize: function () {
      var self = this;

      this.listenTo(this, "project:save", function (title, description) {
        var project = new ProjectModel({ title: title, description: description })
        self.add(project);
        self.models.forEach(function (model) {
          model.save();
        });
        self.trigger("project:save:success");
      });

    }

  });

  return ProjectsCollection;
});
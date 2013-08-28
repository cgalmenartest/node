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
        console.log("BEFORE WE ADD PROJECT MODEL TO SELF", self);
        self.add(project);
        console.log("AFTER WE ADD PROJECT MODEL TO SELF", self);
        self.models.forEach(function (model) {
          model.save();
        });
        self.trigger("project:save:success");
      });
    } 

  });

  return ProjectsCollection;
});

// Archived to refer back to:
//   this.on("project:post", function (title, description) {
//     var project = new ProjectModel({ title: title, description: description })
//     _this.add(project);
//     _this.models.forEach(function (_model) {
//       _model.save();
//     });
//     app.events.trigger("projectSave:success");
//   });

//   app.events.on("projectSave:success", function () {
//     _this.fetch();
//     app.events.trigger("project:render");
//   });

// },

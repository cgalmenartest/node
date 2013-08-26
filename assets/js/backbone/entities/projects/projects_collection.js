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
      this.initializeProjectCollectionFetchListeners();
    },

    initializeProjectCollectionFetchListeners: function () {
      var self = this;
      
      entities.request.once("projects:fetch", function () {
        self.fetch({
          success: function (data) { 
            entities.request.trigger("projectFetch:success", data)
          }
        });
        
      })
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

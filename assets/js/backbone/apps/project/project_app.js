define([
  'jquery',
  'underscore',
  'backbone',
  'project_model',
  'project_list_controller',
  'project_show_controller'
], function ($, _, Backbone, ProjectModel, ProjectListController, ProjectShowController) {

  var ProjectRouter = Backbone.Router.extend({

    routes: {
      'projects(/)'			: 'list',
      'projects/:id(/)' : 'show'
    },

    list: function () {
      $("#container").children().remove();
      if (this.projectListController) {
        this.projectListController.initialize({ router: this });
      } else {
        this.projectListController = new ProjectListController({ router: this });
      }
    },

    show: function (id) {
      var self = this;
      $("#container").children().remove();
      var model = new ProjectModel();
      model.set({ id: id });
      if (self.projectShowController) self.projectShowController.cleanup();
      self.projectShowController = new ProjectShowController({ model: model, router: this });
    },

  });

  var initialize = function () {
    var router = new ProjectRouter();
  } 

  return {
    initialize: initialize
  };
});

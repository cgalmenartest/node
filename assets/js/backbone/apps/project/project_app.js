define([
  'underscore',
  'backbone',
  'project_list_controller'
], function (_, Backbone, ProjectListController) {

  var ProjectRouter = Backbone.Router.extend({

    routes: {
      'projects'			: 'list'
    },

    list: function () {
      $("#container").children().remove();
      if (this.projectListController) {
        this.projectListController.initialize();
      } else {
        this.projectListController = new ProjectListController();
      }
    }
  });

  var initialize = function () {
    var router = new ProjectRouter();
  } 

  return {
    initialize: initialize
  };
});

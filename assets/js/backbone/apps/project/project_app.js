
var _ = require('underscore');
var Backbone = require('backbone');
var ProjectModel = require('../../entities/projects/project_model');
//var ProjectListController = require('../../project_list_controller');
var ProjectShowController = require('./show/controllers/project_show_controller');
var utilities = require('../../mixins/utilities');
var TaskShowController = require('../tasks/show/controllers/task_show_controller');
var TaskModel = require('../../entities/tasks/task_model');


var ProjectRouter = Backbone.Router.extend({

  routes: {
    'projects(/)'               : 'list',
    'projects/:id(/)'           : 'show',
    'projects/:id/tasks/:id(/)' : 'showTask'
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
    clearContainer();

    var model = new ProjectModel();
    model.set({ id: id });

    if (this.projectShowController) this.projectShowController.cleanup();
    this.projectShowController = new ProjectShowController({ model: model, router: this });
  },

  showTask: function (noop, taskId) {
    clearContainer();
    scrollTop();

    var self = this,
        model = new TaskModel();

    model.fetch({
      url: '/api/task/' + taskId,
      success: function (taskModel) {
        if (self.taskShowController) self.taskShowController.cleanup();
        self.taskShowController = new TaskShowController({ model: taskModel, router: self });
      }
    });
  }

});

var initialize = function () {
  var router = new ProjectRouter();
}

module.exports = {
  initialize: initialize
};

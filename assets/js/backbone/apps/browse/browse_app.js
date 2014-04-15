define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'nav_view',
  'footer_view',
  'browse_list_controller',
  'project_model',
  'project_show_controller',
  'profile_show_controller',
  'task_model',
  'task_show_controller',
  'task_edit_form_view',
  'admin_main_controller'
], function ($, _, Backbone, utils, NavView, FooterView, BrowseListController,
  ProjectModel, ProjectShowController, ProfileShowController, TaskModel,
  TaskShowController, TaskEditFormView, AdminMainController) {

  var BrowseRouter = Backbone.Router.extend({

    routes: {
      ''                          : 'redirectHome',
      'projects(/)'               : 'listProjects',
      'projects/:id(/)'           : 'showProject',
      'projects/:id/:action(/)'   : 'showProject',
      'tasks(/)'                  : 'listTasks',
      'tasks/:id(/)'              : 'showTask',
      'tasks/:id/:action(/)'      : 'showTask',
      'profile(/)'                : 'showProfile',
      'profile/:id(/)'            : 'showProfile',
      'admin(/)'                  : 'showAdmin',
      'admin(/):action(/)'        : 'showAdmin'
    },

    data: { saved: false },

    initialize: function () {
      this.navView = new NavView({
        el: '.navigation'
      }).render();
      this.footerView = new FooterView({
        el: '#footer'
      }).render();
    },

    cleanupChildren: function () {
      if (this.browseListController) { this.browseListController.cleanup(); }
      if (this.projectShowController) { this.projectShowController.cleanup(); }
      if (this.profileShowController) { this.profileShowController.cleanup(); }
      if (this.taskShowController) { this.taskShowController.cleanup(); }
      this.data = { saved: false };
    },

    redirectHome: function () {
      Backbone.history.navigate('/projects', { trigger: true });
    },

    listProjects: function () {
      this.cleanupChildren();
      this.browseListController = new BrowseListController({
        target: 'projects',
        el: '#container',
        data: this.data
      });
    },

    listTasks: function () {
      this.cleanupChildren();
      this.browseListController = new BrowseListController({
        target: 'tasks',
        el: '#container',
        data: this.data
      });
    },

    showProject: function (id, action) {
      this.cleanupChildren();
      var model = new ProjectModel();
      model.set({ id: id });
      this.projectShowController = new ProjectShowController({ model: model, router: this, id: id, action: action, data: this.data });
    },

    showTask: function (id, action) {
      this.cleanupChildren();
      var model = new TaskModel();
      model.set({ id: id });
      this.taskShowController = new TaskShowController({ model: model, router: this, id: id, action: action, data: this.data });
    },

    showProfile: function (id) {
      this.cleanupChildren();
      this.profileShowController = new ProfileShowController({ id: id, data: this.data });
    },

    showAdmin: function (action) {
      this.cleanupChildren();
      this.adminMainController = new AdminMainController({
        el: "#container",
        action: action
      });
    }

  });

  var initialize = function () {
    var router = new BrowseRouter();
    return router;
  }

  return {
    initialize: initialize
  };
});

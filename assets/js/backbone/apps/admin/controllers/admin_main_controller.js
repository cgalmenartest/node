define([
  'jquery',
  'underscore',
  'async',
  'backbone',
  'utilities',
  'base_controller',
  'admin_main_view'
], function ($, _, async, Backbone, utils, BaseController, AdminMainView) {

  Application.Admin = {};

  Application.Admin.ShowController = BaseController.extend({

    events: {
    },

    // Initialize the admin view
    initialize: function (options) {
      this.options = options;
      this.adminMainView = new AdminMainView({
        action: options.action,
        el: this.el
      }).render();
    },

    // Cleanup controller and views
    cleanup: function() {
      this.adminMainView.cleanup();
      removeView(this);
    }

  });

  return Application.Admin.ShowController;
});
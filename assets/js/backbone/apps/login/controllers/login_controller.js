define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'utilities',
  'base_controller',
  'login_view',
  'login_config',
  'modal_component'
], function ($, _, Backbone, Bootstrap, utils, BaseController, LoginView, Login, ModalComponent) {

  Application.Login = BaseController.extend({

    events: {
    },

    initialize: function ( options ) {
      var self = this;
      this.options = options;
      this.initializeView();
    },

    initializeView: function () {
      if (this.loginView) {
        this.loginView.cleanup();
        this.modalComponent.cleanup();
      }

      this.modalComponent = new ModalComponent({
        el: this.el,
        id: "login",
        modalTitle: "Login or Register"
      }).render();

      this.loginView = new LoginView({
        el: ".modal-template",
        login: Login,
        message: this.options.message
      }).render();
      $("#login").modal('show');

      window.cache.userEvents.on("user:login", function (user) {
        // hide the modal
        $('#login').bind('hidden.bs.modal', function() {
          // reload the page after login
          Backbone.history.loadUrl();
          window.cache.userEvents.trigger("user:login:success", user);
        }).modal('hide');
      });
    },

    // ---------------------
    //= UTILITY METHODS
    // ---------------------
    cleanup: function() {
      // don't do anything
      if (this.loginView) { this.loginView.cleanup(); }
      if (this.modalComponent) { this.modalComponent.cleanup(); }
      removeView(this);
    }

  });

  return Application.Login;
})
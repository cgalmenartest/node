define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'utilities',
  'base_controller',
  'login_view',
  'json!login_config',
  'modal_component'
], function ($, _, Backbone, Bootstrap, utils, BaseController, LoginView, Login, ModalComponent) {

  Application.Login = BaseController.extend({

    events: {
      "click #register-cancel"   : "showLogin",
      "click #login-register"    : "showRegister",
      "click #forgot-done-cancel": "showLogin",
      "click #forgot-cancel"     : "showLogin",
      "click #forgot-password"   : "showForgot"
    },

    initialize: function ( options ) {
      var self = this;
      this.options = options;
      this.initializeView();
    },

    initializeView: function () {
      var self = this;
      if (this.loginView) {
        this.loginView.cleanup();
        this.modalComponent.cleanup();
      }

      // initialize the modal
      if (!_.isUndefined(this.options.message)) {
        var disableClose = this.options.message.disableClose || false;
      }
      this.modalComponent = new ModalComponent({
        el: this.el,
        id: "login",
        modalTitle: "Login or Register",
        disableClose: disableClose
      }).render();

      // put the login view inside the modal
      this.loginView = new LoginView({
        el: ".modal-template",
        login: Login,
        message: this.options.message
      }).render();
      this.$("#registration-view").hide();
      this.$("#forgot-view").hide();
      this.$("#forgot-done-view").hide();
      $("#login").modal('show');

      self.listenTo(window.cache.userEvents, "user:login", function (user) {
        // hide the modal
        self.stopListening(window.cache.userEvents);
        // window.cache.userEvents.stopListening();
        $('#login').bind('hidden.bs.modal', function() {
          // reload the page after login
          Backbone.history.loadUrl();
          window.cache.userEvents.trigger("user:login:success", user);
          self.cleanup();
        }).modal('hide');
      });
    },

    showRegister: function (e) {
      if (e.preventDefault) e.preventDefault();
      this.$("#login-view").hide();
      this.$("#login-footer").hide();
      this.$("#registration-view").show();
      this.$("#registration-footer").show();
      this.$("#forgot-view").hide();
      this.$("#forgot-footer").hide();
      this.$("#forgot-done-view").hide();
      this.$("#forgot-done-footer").hide();
    },

    showLogin: function (e) {
      if (e.preventDefault) e.preventDefault();
      this.$("#login-view").show();
      this.$("#login-footer").show();
      this.$("#registration-view").hide();
      this.$("#registration-footer").hide();
      this.$("#forgot-view").hide();
      this.$("#forgot-footer").hide();
      this.$("#forgot-done-view").hide();
      this.$("#forgot-done-footer").hide();
    },

    showForgot: function (e) {
      if (e.preventDefault) e.preventDefault();
      this.$("#forgot-view").show();
      this.$("#forgot-footer").show();
      this.$("#registration-view").hide();
      this.$("#registration-footer").hide();
      this.$("#login-view").hide();
      this.$("#login-footer").hide();
      this.$("#forgot-done-view").hide();
      this.$("#forgot-done-footer").hide();
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

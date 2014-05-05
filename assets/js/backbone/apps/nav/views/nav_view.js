define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'json!login_config',
  'login_controller',
  'text!nav_template'
], function ($, _, Backbone, utils, Login, LoginController, NavTemplate) {

  var NavView = Backbone.View.extend({

    events: {
      'click .navbar-brand'   : linkBackbone,
      'click .nav-link'       : linkBackbone,
      'click .login'          : 'loginClick',
      'click .logout'         : 'logout'
    },

    initialize: function (options) {
      var self = this;
      this.options = options;

      this.listenTo(window.cache.userEvents, "user:login:success", function (userData) {
        self.doRender({ user: userData });
      });

      this.listenTo(window.cache.userEvents, "user:logout", function () {
        self.doRender({ user: null });
        Backbone.history.loadUrl();
        window.cache.userEvents.trigger("user:logout:success");
      });

      // request that the user log in to see the page
      this.listenTo(window.cache.userEvents, "user:request:login", function (message) {
        // trigger the login modal
        self.login(message);
      });

      // update the navbar when the profile changes
      this.listenTo(window.cache.userEvents, "user:profile:save", function (data) {
        // reset the currentUser object
        window.cache.currentUser = data;
        // re-render the view
        self.render();
      });

      // update the user's photo when they change it
      this.listenTo(window.cache.userEvents, "user:profile:photo:save", function (url) {
        $(".navbar-people").attr('src', url);
      });
    },

    render: function () {
      var self = this;
      this.doRender({ user: window.cache.currentUser });
      return this;
    },

    doRender: function (data) {
      data.login = Login;
      var template = _.template(NavTemplate, data);
      this.$el.html(template);
      $(".nav li").on("click", function () {
        $(".nav li").removeClass("active");
        $(this).addClass("active");
      });
    },

    loginClick: function (e) {
      if (e.preventDefault) e.preventDefault();
      this.login();
    },

    login: function (message) {
      if (this.loginController) {
        this.loginController.cleanup();
      }
      this.loginController = new LoginController({
        el: '#login-wrapper',
        message: message
      });
    },

    logout: function (e) {
      if (e.preventDefault) e.preventDefault();
      $.ajax({
        url: '/api/auth/logout?json=true',
      }).done(function (success) {
        window.cache.currentUser = null;
        window.cache.userEvents.trigger("user:logout");
      }).fail(function (error) {
        // do nothing
      });
    },

    cleanup: function () {
      if (this.loginController) { this.loginController.cleanup(); }
      removeView(this);
    },
  });

  return NavView;
});
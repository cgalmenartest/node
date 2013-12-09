define([
  'jquery',
  'dropzone',
  'underscore',
  'backbone',
  'utilities',
  'login_controller',
  'text!nav_template'
], function ($, dropzone, _, Backbone, utils, LoginController, NavTemplate) {

  var NavView = Backbone.View.extend({

    events: {
      'click .nav-link': 'link',
      'click .login': 'login',
      'click .logout': 'logout'
    },

    initialize: function (options) {
      var self = this;
      this.options = options;

      window.cache.userEvents.on("user:login", function (userData) {
        self.doRender({ user: userData });
      });

      window.cache.userEvents.on("user:logout", function () {
        self.doRender({ user: null });
        Backbone.history.loadUrl();
      });
    },

    render: function () {
      var self = this;
      this.doRender({ user: window.cache.currentUser });
      return this;
    },

    doRender: function (data) {
      var template = _.template(NavTemplate, data);
      this.$el.html(template);
      $(".nav li").on("click", function () {
        $(".nav li").removeClass("active");
        $(this).addClass("active");
      });
    },

    link: function (e) {
      if (e.preventDefault) e.preventDefault();
      var link = $(e.currentTarget).attr('href').slice(1);
      Backbone.history.navigate(link, { trigger: true });
    },

    login: function (e) {
      if (e.preventDefault) e.preventDefault();
      if (this.loginController) {
        this.loginController.cleanup();
      }
      this.loginController = new LoginController({
        el: '#login-wrapper'
      });
    },

    logout: function (e) {
      if (e.preventDefault) e.preventDefault();
      $.ajax({
        url: '/auth/logout?json=true',
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
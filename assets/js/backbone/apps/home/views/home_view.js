
var _ = require('underscore');
var Backbone = require('backbone');
var async = require('async');
var utils = require('../../../mixins/utilities');
var i18n = require('i18next-client');
var UIConfig = require('../../../config/ui.json');
var Login = require('../../../config/login.json');
var LoginController = require('../../login/controllers/login_controller');
var HomeTemplate = require('../templates/home_view_template.html');


var HomeView = Backbone.View.extend({

  el: "#container",

  events: {
    'click .login'          : 'loginClick'
  },

  initialize: function (options) {
    this.options = options;
    this.listenTo(window.cache.userEvents, "user:login:success", function (user) {
      Backbone.history.navigate(UIConfig.home.logged_in_path, { trigger: true });
    });
  },

  render: function () {
    var compiledTemplate;
    var data = {
      hostname: window.location.hostname,
      user: window.cache.currentUser || {},
    };

    this.$el.addClass('home');
    compiledTemplate = _.template(HomeTemplate)(data);
    this.$el.html(compiledTemplate);
    this.$el.i18n();

    return this;
  },

  loginClick: function (e) {
    if (e.preventDefault) e.preventDefault();
    if (window.cache.currentUser) {
      // we're already logged in
      Backbone.history.navigate(UIConfig.home.logged_in_path, { trigger: true });
    } else {
      this.login();
    }
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

  cleanup: function () {
    this.$el.removeClass('home');
    removeView(this);
  },
});

module.exports = HomeView;

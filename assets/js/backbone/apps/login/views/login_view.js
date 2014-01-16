define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!login_template',
  'modal_component'
], function ($, _, Backbone, utils, LoginTemplate, ModalComponent) {

  var LoginView = Backbone.View.extend({

    events: {
      'click .oauth-link'              : 'link',
      'keyup #rusername'               : 'checkUsername',
      'click #rusername-button'        : 'clickUsername',
      'submit #login-password-form'    : 'submitLogin',
      'submit #registration-form'      : 'submitRegister'
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      data = {
        login: this.options.login,
        message: this.options.message
      }
      var template = _.template(LoginTemplate, data);
      this.$el.html(template);
      return this;
    },

    link: function (e) {
      if (e.preventDefault) e.preventDefault();
      var link = $(e.currentTarget).attr('href');
      window.location.href = link;
    },

    v: function (e) {
      return validate(e);
    },

    submitLogin: function (e) {
      var self = this;
      if (e.preventDefault) e.preventDefault();
      var data = {
        username: this.$("#username").val(),
        password: this.$("#password").val(),
        json: true
      };
      $.ajax({
        url: '/api/auth/local',
        type: 'POST',
        data: data
      }).done(function (success) {
        // Set the user object and trigger the user login event
        window.cache.currentUser = success;
        window.cache.userEvents.trigger("user:login", success);
      }).fail(function (error) {
        var d = JSON.parse(error.responseText);
        self.$("#login-error").html(d.message);
        self.$("#login-error").show();
      });
    },

    submitRegister: function (e) {
      var self = this;
      if (e.preventDefault) e.preventDefault();

      // validate input fields
      var validateIds = ['#rusername', '#rpassword', '#rterms'];
      var abort = false;
      for (i in validateIds) {
        var iAbort = validate({ currentTarget: validateIds[i] });
        abort = abort || iAbort;
      }
      if (abort === true) {
        return;
      }

      var data = {
        username: this.$("#rusername").val(),
        password: this.$("#rpassword").val(),
        json: true
      };
      $.ajax({
        url: '/api/auth/local',
        type: 'POST',
        data: data
      }).done(function (success) {
        // Set the user object and trigger the user login event
        window.cache.currentUser = success;
        window.cache.userEvents.trigger("user:login", success);
      }).fail(function (error) {
        var d = JSON.parse(error.responseText);
        self.$("#registration-error").html(d.message);
        self.$("#registration-error").show();
      });
    },

    checkUsername: function (e) {
      var username = $("#rusername").val();
      $("#rusername-button").removeClass('btn-success');
      $("#rusername-button").removeClass('btn-danger');
      $("#rusername-button").addClass('btn-default');
      $("#rusername-check").removeClass('icon-ok');
      $("#rusername-check").removeClass('icon-remove');
      $("#rusername-check").addClass('icon-spin');
      $("#rusername-check").addClass('icon-spinner');
      $.ajax({
        url: '/api/user/username/' + username,
      }).done(function (data) {
        $("#rusername-check").removeClass('icon-spin');
        $("#rusername-check").removeClass('icon-spinner');
        $("#rusername-button").removeClass('btn-default');
        if (data) {
          // username is take
          $("#rusername-button").addClass('btn-danger');
          $("#rusername-check").addClass('icon-remove');
        } else {
          // username is available
          $("#rusername-button").addClass('btn-success');
          $("#rusername-check").addClass('icon-ok');
        }
      });
    },

    clickUsername: function (e) {
      e.preventDefault();
    },

    cleanup: function () {
      removeView(this);
    },
  });

  return LoginView;
});

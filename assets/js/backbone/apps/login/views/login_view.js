define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'login_password_view',
  'text!login_template',
  'modal_component'
], function ($, _, Backbone, utils, LoginPasswordView, LoginTemplate, ModalComponent) {

  var LoginView = Backbone.View.extend({

    events: {
      'click .oauth-link'              : 'link',
      'keyup #rusername'               : 'checkUsername',
      'click #rusername-button'        : 'clickUsername',
      'keyup #rpassword'               : 'checkPassword',
      'blur #rpassword'                : 'checkPassword',
      'submit #login-password-form'    : 'submitLogin',
      'submit #registration-form'      : 'submitRegister',
      'submit #forgot-form'            : 'submitForgot'
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var self = this;
      var data = {
        login: this.options.login,
        message: this.options.message
      };
      var template = _.template(LoginTemplate, data);
      this.$el.html(template);
      this.loginPasswordView = new LoginPasswordView({
        el: this.$(".password-view")
      }).render();
      setTimeout(function () {
        self.$("#username").focus();
      }, 500);
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
      var validateIds = ['#rusername', '#rpassword'];
      // Only validate terms & conditions if it is enabled
      if (this.options.login.terms.enabled === true) {
        validateIds.push('#rterms');
      }
      var abort = false;
      for (i in validateIds) {
        var iAbort = validate({ currentTarget: validateIds[i] });
        abort = abort || iAbort;
      }
      var passwordSuccess = this.checkPassword();
      var parent = $(this.$("#rpassword").parents('.form-group')[0]);
      if (passwordSuccess !== true) {
        parent.addClass('has-error');
        $(parent.find('.error-password')[0]).show();
      } else {
        $(parent.find('.error-password')[0]).hide();
      }
      if (abort === true || passwordSuccess !== true) {
        return;
      }

      // Create a data object with the required fields
      var data = {
        username: this.$("#rusername").val(),
        password: this.$("#rpassword").val(),
        json: true
      };
      // Add in additional, optional fields
      if (this.options.login.terms.enabled === true) {
        data['terms'] = (this.$("#rterms").val() == "on");
      }
      // Post the registration request to the server
      $.ajax({
        url: '/api/auth/register',
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

    submitForgot: function (e) {
      var self = this;
      if (e.preventDefault) e.preventDefault();
      var data = {
        username: this.$("#fusername").val()
      };
      // Post the registration request to the server
      $.ajax({
        url: '/api/auth/forgot',
        type: 'POST',
        data: data
      }).done(function (success) {
        // Set the user object and trigger the user login event
        self.$("#forgot-view").hide();
        self.$("#forgot-footer").hide();
        self.$("#forgot-done-view").show();
        self.$("#forgot-done-footer").show();
      }).fail(function (error) {
        var d = JSON.parse(error.responseText);
        self.$("#forgot-error").html(d.message);
        self.$("#forgot-error").show();
      });
    },

    checkUsername: function (e) {
      var username = $("#rusername").val();
      $.ajax({
        url: '/api/user/username/' + username,
      }).done(function (data) {
        $("#rusername-button").removeClass('btn-success');
        $("#rusername-button").removeClass('btn-danger');
        $("#rusername-check").removeClass('icon-ok');
        $("#rusername-check").removeClass('icon-remove');
        if (data) {
          // username is taken
          $("#rusername-button").addClass('btn-danger');
          $("#rusername-check").addClass('icon-remove');
        } else {
          // username is available
          $("#rusername-button").addClass('btn-success');
          $("#rusername-check").addClass('icon-ok');
        }
      });
    },

    checkPassword: function (e) {
      var rules = validatePassword(this.$("#rusername").val(), this.$("#rpassword").val());
      var success = true;
      _.each(rules, function (value, key) {
        if (value === true) {
          this.$(".password-rules .success.rule-" + key).show();
          this.$(".password-rules .error.rule-" + key).hide();
        } else {
          this.$(".password-rules .success.rule-" + key).hide();
          this.$(".password-rules .error.rule-" + key).show();
        }
        success = success && value;
      });
      return success;
    },

    clickUsername: function (e) {
      e.preventDefault();
    },

    cleanup: function () {
      if (this.loginPasswordView) { this.loginPasswordView.cleanup(); }
      removeView(this);
    },
  });

  return LoginView;
});

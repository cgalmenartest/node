define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'utilities',
    'text!admin_user_password_template'
], function ($, Bootstrap, _, Backbone, utils, AdminUserPassword) {

  var AdminUserPasswordView = Backbone.View.extend({

    events: {
      "blur #newPassword"             : "v",
      "submit #reset-password"        : "post"
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var data = {
        admin: this.options.admin,
        u: this.options.user
      }
      var template = _.template(AdminUserPassword, data);
      this.$el.html(template);
      return this;
    },

    v: function (e) {
      return validate(e);
    },

    post: function (e) {
      var self = this;
      if (e.preventDefault) e.preventDefault();

      // validate input fields
      var validateIds = ['#newPassword'];
      var abort = false;
      for (i in validateIds) {
        var iAbort = validate({ currentTarget: validateIds[i] });
        abort = abort || iAbort;
      }
      if (abort === true) {
        return;
      }

      // execute password reset
      var data;
      data = {
        id: this.options.user.id,
        password: this.$("#newPassword").val()
      };

      $.ajax({
        url: '/api/user/resetPassword',
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
          if (data === true) {
            // collapse modal
            $("#reset-password-modal").modal('hide');
            return;
          }
          self.processError({ message: 'An error occurred while trying to save the password: the server provided an unexpected response.'})
        },
        error: function (xhr, status, error) {
          self.processError(xhr.responseJSON);
        }
      });

    },

    processError: function (e) {
      this.$(".alert").html(e.message || e);
      this.$(".alert").show();
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return AdminUserPasswordView;

});
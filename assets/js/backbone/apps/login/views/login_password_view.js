define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!login_password_template'
], function ($, _, Backbone, utils, LoginPasswordTemplate, ModalComponent) {

  var LoginPasswordView = Backbone.View.extend({

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var template = _.template(LoginPasswordTemplate);
      this.$el.html(template);
      return this;
    },

    cleanup: function () {
      removeView(this);
    },
  });

  return LoginPasswordView;
});

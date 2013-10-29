define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'utilities',
  'text!profile_email_form_template'
], function ($, Bootstrap, _, Backbone, utils, EmailFormTemplate) {

  var EmailFormView = Backbone.View.extend({

    events: {
      "submit #email-form" : "post"
    },

    initialize: function (options) {
      this.target = options.target;
      this.options = options;
    },

    render: function () {
      var template = _.template(EmailFormTemplate, {});
      this.$el.html(template);
      return this;
    },

    post: function (e) {
      if (e.preventDefault) e.preventDefault();
      var data;
      var self = this;

      data = {
        email: $(e.currentTarget).find("#email").val(),
      }

      $.ajax({
        url: '/api/useremail',
        type: 'POST',
        data: data
      }).done(function (result) {
        // Pass the tag back
        self.options.model.trigger(self.target + ":email:new", result);
      });

    },

    cleanup: function () {
      removeView(this);
    }

  });

  return EmailFormView;

});
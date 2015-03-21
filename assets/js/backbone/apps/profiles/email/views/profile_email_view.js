
var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var EmailFormTemplate = require('../templates/profile_email_form.html');


var EmailFormView = Backbone.View.extend({

  events: {
    "submit #email-form" : "post"
  },

  initialize: function (options) {
    this.target = options.target;
    this.options = options;
  },

  render: function () {
    var template = _.template(EmailFormTemplate)({});
    this.$el.html(template);
    return this;
  },

  post: function (e) {
    if (e.preventDefault) e.preventDefault();
    var data;
    var self = this;

    this.$(".alert").hide();
    data = {
      email: $(e.currentTarget).find("#email").val(),
    }

    $.ajax({
      url: '/api/useremail',
      type: 'POST',
      data: data,
      success: function (result) {
        // Pass the tag back
        self.options.model.trigger(self.target + ":email:new", result);
      },
      error: function (req, status, error) {
        self.$(".alert").html(req.responseJSON.message);
        self.$(".alert").show();
        self.options.model.trigger(self.target + ":email:error", req.responseJSON);
      }
    });

  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = EmailFormView;

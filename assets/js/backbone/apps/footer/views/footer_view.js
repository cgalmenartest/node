define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'json!login_config',
  'text!footer_template'
], function ($, _, Backbone, utils, Login, FooterTemplate) {

  var FooterView = Backbone.View.extend({

    events: {
    },

    render: function () {
      var self = this;
      var data = {
        version: version,
        login: Login
      };
      var compiledTemplate = _.template(FooterTemplate, data);
      this.$el.html(compiledTemplate);

      function resizeElements() {
        headerHeight = $('.navbar').height();
        footerHeight = $('footer').height();
        if (($(document.body).height() + footerHeight) < $(window).height()) {
          self.$el.addClass('navbar-fixed-bottom');
        } else {
          self.$el.removeClass('navbar-fixed-bottom');
        }
      }
      resizeElements();
      $(".container").bind("DOMSubtreeModified", resizeElements);
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return FooterView;
});

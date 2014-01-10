define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!footer_template'
], function ($, _, Backbone, utils, FooterTemplate) {

  var FooterView = Backbone.View.extend({

    events: {
    },

    render: function () {
      var self = this;
      var compiledTemplate = _.template(FooterTemplate, version);
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

define([
  'jquery',
  'dropzone',
  'underscore',
  'backbone',
  'utilities',
  'text!nav_template'
], function ($, dropzone, _, Backbone, utils, NavTemplate) {

  var NavView = Backbone.View.extend({

    events: {
      'click .nav-link': 'link'
    },

    render: function () {
      var self = this;
      this.doRender({ user: null });
      $.ajax('/api/user').done(function (userData) {
        self.doRender({ user: userData });
      });
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

    cleanup: function () {
      removeView(this);
    },
  });

  return NavView;
});
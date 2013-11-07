define([
  'jquery',
  'underscore',
  'backbone',
  'nav_view'
], function ($, _, Backbone, NavView) {

  var NavRouter = Backbone.Router.extend({

    initialize: function() {
      console.log('nav::new::init');
      this.view = new NavView({
        el: '.navigation'
      }).render();
    }

  });

  var initialize = function () {
    console.log('nav::init');
    var router = new NavRouter();
    return router;
  }

  return {
    initialize: initialize
  };
});

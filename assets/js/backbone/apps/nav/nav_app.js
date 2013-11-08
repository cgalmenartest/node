define([
  'jquery',
  'underscore',
  'backbone',
  'nav_view'
], function ($, _, Backbone, NavView) {

  var NavRouter = Backbone.Router.extend({

    initialize: function() {
      this.view = new NavView({
        el: '.navigation'
      }).render();
    }

  });

  var initialize = function () {
    var router = new NavRouter();
    return router;
  }

  return {
    initialize: initialize
  };
});

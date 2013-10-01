define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  Application.BaseView = Backbone.View.extend({

    initialize: function () {
      
    }

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return Application.BaseView;
})
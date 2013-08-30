define([
  'underscore',
  'backbone',
], function () {

  Application.BaseView = Backbone.View.extend({

    initialize: function () {
      
    }

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return Application.BaseView;
})
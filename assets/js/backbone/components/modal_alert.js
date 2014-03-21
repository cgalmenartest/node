define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'utilities',
  'text!modal_alert_template'
], function ($, Bootstrap, _, Backbone, utils, ModalTemplate) {

  var ModalAlert = Backbone.View.extend({

    events: {
      "submit #modal-form"    : "post"
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var template = _.template(ModalTemplate, this.options);
      this.$el.html(template);
      $(this.options.modalDiv).modal('show');
      return this;
    },

    post: function (e) {
      var self = this;
      if (e.preventDefault) e.preventDefault();
      $(this.options.modalDiv).bind('hidden.bs.modal', function() {
        self.options.callback(e);
      }).modal('hide');
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return ModalAlert;

});
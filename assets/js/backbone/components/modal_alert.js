var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../mixins/utilities');
var ModalTemplate = require('./modal_alert_template.html');


var ModalAlert = Backbone.View.extend({

  events: {
    "submit #modal-form"    : "post"
  },

  initialize: function (options) {
    this.options = options;
  },

  render: function () {
    var template = _.template(ModalTemplate)(this.options);
    this.$el.html(template);
    this.$el.i18n();
    $(this.options.modalDiv).modal('show');
    return this;
  },

  post: function (e) {
    var self = this;
    var hasError = false;

    if (e.preventDefault) e.preventDefault();

    //check any .validate elements and don't submit if they fail
    if ( self.options.validateBeforeSubmit ){
      $(".validate").each(function(index){
        hasError = validate({currentTarget: this});
        if ( hasError ){ return false; }
      });
    }

    if ( !hasError ) {
      $(this.options.modalDiv).bind('hidden.bs.modal', function() {
        self.options.callback(e);
      }).modal('hide');
    }
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = ModalAlert;

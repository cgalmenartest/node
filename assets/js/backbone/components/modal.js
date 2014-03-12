// The Modal component needs to be set to the el: of the parent view
// you are trying to init it within, then you will be appending the modal-template to that
// view (this).  Then the form view has an el of $(".modal-body") so that the form will render
// within that body area.
// Then all you have to do is set the ID of the modal to the ID of the link you are trying
// to trigger from as per bootstrap BP.

define([
  'jquery',
	'underscore',
	'backbone',
  'utilities',
	'base_component',
  'text!modal_template'
], function ($, _, Backbone, utils, BaseComponent, ModalTemplate) {

	Application.Component.Modal = BaseComponent.extend({

    template: _.template(ModalTemplate),

		initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var data = {
        id: this.options.id,
        modalTitle: this.options.modalTitle
      };

      var compiledTemplate = this.template(data);
      this.$el.append(compiledTemplate);

      return this;
    },

    cleanup: function () {
      removeView(this);
    }

	});

	return Application.Component.Modal;
})
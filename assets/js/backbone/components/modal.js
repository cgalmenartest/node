// The Modal component needs to be set to the el: of the parent view
// you are trying to init it within, then you will be appending the modal-template to that
// view (this).  Then the form view has an el of $(".modal-body") so that the form will render
// within that body area.
// Then all you have to do is set the ID of the modal to the ID of the link you are trying
// to trigger from as per bootstrap BP.

define([
	'underscore',
	'backbone',
	'base_component',
  'text!modal_template'
], function (_, Backbone, BaseComponent, ModalTemplate) {

	Application.Component.Modal = BaseComponent.extend({

    template: _.template(ModalTemplate),

		intialize: function (options) {
      this.options = _.extend(this.defaults, options);
      this.render();
    },

    render: function () {

      if (this.options.id) {
        this.data = {
          id: this.options.id
        }
      }

      var compiledTemplate = this.template(this.data);
      this.$el.append(compiledTemplate);
    }

	});

	return Application.Component.Modal;
})
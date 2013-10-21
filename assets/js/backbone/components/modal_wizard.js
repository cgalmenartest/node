// Similar to Modal component in every way in all ways but two:
// 1) This modal has a next button instead of save button.
// 2) This modal has some expectations inside the modal-body form.
//    ^ More on this below
//
// This is all the component expects for it to work:
// <div class='modal-body'>
//  <section class="current">First content section</section>
//  <section>Second content section</section>
//  <section>Third content section</section>
//  <!-- and so on -->
// </div>
//
// REMEMBER: This goes inside your formTemplate.  This
// is the ModalWizardComponent, which is scoped to list controller,
// then the Form itself for the addition to the list is scoped to the
// modal-body within this modal-component template.
define([
  'jquery',
  'underscore',
  'backbone',
  'base_component',
  'text!modal_wizard_template'
], function ($, _, Backbone, BaseComponent, ModalWizardTemplate) {

  Application.Component.ModalWizard = BaseComponent.extend({

    template: _.template(ModalWizardTemplate),

    events: {
      "click .wizard-forward": "moveWizardForward"
    },

    intialize: function (options) {
      this.options = _.extend(this.defaults, options);
      this.render();
    },

    render: function () {

      if (this.options) {
        this.data = {
          id: this.options.id,
          modalTitle: this.options.modalTitle
        }
      }

      var compiledTemplate = this.template(this.data);
      this.$el.append(compiledTemplate);

      return this;
    },

    // In order for the ModalWizard to work it expects a section
    // by section layout inside the modal, with a 'current' class on
    // the first you want to always start on (re)render.
    moveWizardForward: function (e) {
      if (e.preventDefault()) e.preventDefault();
      var next    = $(".current").next();
          current = $(".current")

      if (!_.isUndefined(next.html())) {
        current.children().hide();
        current.removeClass("current");
        next.addClass("current");
        next.show();
      } else {
        return;
      }
    },

    moveWizardBack: function (e) {
      if (e.preventDefault()) e.preventDefault();

      var current = $(".current"),
          prev    = $(".current").prev();

      if (!_.isUndefined(prev.html())) {
        current.children().hide();
        current.removeClass("current");
        prev.addClass("current");
        prev.children().show();
      } else {
        return;
      }
    }
  });

  return Application.Component.ModalWizard;
})
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
  'utilities',
  'base_view',
  'text!modal_wizard_template'
], function ($, _, Backbone, utilities, BaseView, ModalWizardTemplate) {

  Application.Component.ModalWizard = BaseView.extend({

    events: {
      "click .wizard-forward" : "moveWizardForward",
      "click .wizard-backward": "moveWizardBackward",
      "click .wizard-submit"  : "submit",
      "click .wizard-cancel"  : "cancel"
    },

    initialize: function (options) {
      this.options = options;
      this.initializeListeners();
    },

    initializeListeners: function () {
      var self = this;
      if (this.model) {
        this.listenTo(this.model, this.options.modelName + ':modal:hide', function () {
          $('.modal.in').modal('hide');
        });
      }
    },

    render: function () {
      var data = {
        id: this.options.id,
        modalTitle: this.options.modalTitle
      };
      var compiledTemplate = _.template(ModalWizardTemplate, data);
      this.$el.html(compiledTemplate);
      return this;
    },

    /**
     * Set the child of this view, so we can remove it
     * when the view is destroyed
     * @return this for chaining
     */
    setChildView: function (view) {
      this.childView = view;
      return this;
    },

    /**
     * Set the callback on the next button of the modal.
     * Useful for callbacks
     * @return this for chaining
     */
    setNext: function (fn) {
      this.childNext = fn;
      return this;
    },

    /**
     * Set the callback on the submit button of the modal.
     * Useful for callbacks
     * @return this for chaining
     */
    setSubmit: function (fn) {
      this.childSubmit = fn;
      return this;
    },

    // In order for the ModalWizard to work it expects a section
    // by section layout inside the modal, with a 'current' class on
    // the first you want to always start on (re)render.
    moveWizardForward: function (e) {
      if (e.preventDefault) e.preventDefault();
      var self = this;

      // Store $(".current") in cache to reduce query times for DOM lookup
      // on future children and adjacent element to the current el.
      var current   = $(".current"),
          next      = current.next(),
          nextHtml  = next.html();

      // Notify the sub-view to see if it is safe to proceed
      // if not, return and stop processing.
      var abort = false;
      if (this.childNext) {
        abort = this.childNext(e, current);
      }
      if (abort === true) {
        return;
      }

      var nextWizardStep = {
        exists: function () {
          return !_.isUndefined(next.next().html());
        },
        doesNotExist: function () {
          return _.isUndefined(next.next().html());
        }
      };

      hideCurrentAndInitializeNextWizardStep();
      if (nextWizardStep.doesNotExist()) {
        $("button.wizard-forward").hide();
        $("button.wizard-submit").show();
      }

      function hideCurrentAndInitializeNextWizardStep () {
        current.hide();
        current.removeClass("current");
        next.addClass("current");
        next.show();
      };
    },

    moveWizardBackward: function (e) {
      if (e.preventDefault) e.preventDefault();

      var current   = $(".current"),
          prev      = current.prev(),
          prevHtml  = prev.html();

      if (!_.isUndefined(prevHtml)) {
        current.hide();
        current.removeClass("current");
        prev.addClass("current");
        prev.show();
        $("button.wizard-forward").show();
        $("button.wizard-submit").hide();
      } else {
        return;
      }
    },

    // Dumb submit.  Everything is expected via a promise from
    // from the instantiation of this modal wizard.
    submit: function (e) {
      if (e.preventDefault) e.preventDefault();

      var d = this.options.data(this);
      var abort = false;
      // pass the data to the view
      if (this.childSubmit) {
        // if submit returns true, abort modal processing
        abort = this.childSubmit(e, this.$(".current"));
      }

      if (abort === true) {
        return;
      }

      $('.modal.in').modal('hide');
      this.collection.trigger(this.options.modelName + ":save", d);
    },

    cancel: function (e) {
      if (e.preventDefault) e.preventDefault();
      $('.modal.in').modal('hide');
    },

    cleanup: function () {
      if (this.childView) { this.childView.cleanup(); }
      removeView(this);
    }
  });

  return Application.Component.ModalWizard;
})
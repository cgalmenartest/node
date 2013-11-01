// This class implements a paradigm wherein it renders its own child class.
// Doing this allows us to perform logic against it.

// NOTES:
// 'this' refers to the prototype class, not the constructor (logical this).
// This is very useful for smaller el regions, such as a task list
// or anything that requires a small spinner.  Currently to add a bigger spinner
// I'd have to exchange the gif currently provided by font-awesome.

define([
  'jquery',
  'underscore',
  'backbone',
  'utilities'
], function ($, _, Backbone, utilities) {

  var BaseView = Backbone.View.extend({

    initialize: function () {
      this.initializeFunctionPrototype();
      this.initializeAjaxSpinnerOnRender();
    },

    initializeFunctionPrototype: function () {
      addSpinnerToFunctionPrototype(this);
    },

    initializeAjaxSpinnerOnRender: function () {
      this.render.addSpinner();
      this.render();
    },

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return BaseView;
})
define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'text!tag_form_template'
], function ($, Bootstrap, _, Backbone, TagFormTemplate) {
  'use strict';

  var TagFormView = Backbone.View.extend({

    template: _.template(TagFormTemplate),

    events: {
      "submit #tag-form" : "post"
    },

    render: function () {
      this.$el.html(this.template);
      return this;
    },

    post: function (e) {
      if (e.preventDefault()) e.preventDefault();
      var data;

      data = {
        type: '',
        name: ''
      }

      // Add the type

      // Pass the tag back
      //this.collection.trigger("project:save", data);
    },

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return TagFormView;

});
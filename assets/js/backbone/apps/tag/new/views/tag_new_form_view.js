define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'utilities',
  'text!tag_form_template'
], function ($, Bootstrap, _, Backbone, utils, TagFormTemplate) {

  var TagFormView = Backbone.View.extend({

    events: {
      "submit #tag-form" : "post"
    },

    initialize: function (options) {
      this.tags = options.tags;
      this.target = options.target;
      this.options = options;
    },

    render: function () {
      var data = {
        tags: this.tags
      };
      var template = _.template(TagFormTemplate, data);
      this.$el.html(template);
      return this;
    },

    post: function (e) {
      if (e.preventDefault) e.preventDefault();
      var data;
      var self = this;

      data = {
        type: $(e.currentTarget).find("#tag-form-type").val(),
        name: $(e.currentTarget).find("#tag-form-name").val()
      }

      $.ajax({
        url: '/api/tag/add',
        type: 'POST',
        data: data
      }).done(function (result) {
        // Pass the tag back
        self.options.model.trigger(self.target + ":tag:new", result);
      });

    },

    cleanup: function () {
      removeView(this);
    }

  });

  return TagFormView;

});
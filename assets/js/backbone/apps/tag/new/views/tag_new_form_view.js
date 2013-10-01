define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'text!tag_form_template'
], function ($, Bootstrap, _, Backbone, TagFormTemplate) {

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
      var self = this;

      data = {
        type: $(e.currentTarget).find("#tag-form-type").val(),
        name: $(e.currentTarget).find("#tag-form-name").val()
      }
      console.log(data);

      $.ajax({
        url: '/tag/add',
        type: 'POST',
        data: data
      }).done(function (result) {
        // Pass the tag back
        self.options.model.trigger("project:tag:new", result);
      });

    },

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return TagFormView;

});
define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'project_collection',
    'text!project_form_template'
], function ($, Bootstrap, _, Backbone, ProjectsCollection, ProjectFormTemplate) {

  var ProjectFormView = Backbone.View.extend({

    template: _.template(ProjectFormTemplate),

    events: {
      "submit #project-form" : "post"
    },

    render: function () {
      this.$el.html(this.template)
    },

    post: function (e) {
      if (e.preventDefault) e.preventDefault();
      var data;

      data = {
        title       : $(".project-title-form", this.el).val(),
        description : $(".project-description-form", this.el).val()
      }

      this.collection.trigger("project:save", data);
    },

    cleanup: function () {
      this.$el.remove();
    }

  });

  return ProjectFormView;

});
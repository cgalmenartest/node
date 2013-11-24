define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'utilities',
    'project_collection',
    'text!project_form_template'
], function ($, Bootstrap, _, Backbone, utils, ProjectsCollection, ProjectFormTemplate) {

  var ProjectFormView = Backbone.View.extend({

    template: _.template(ProjectFormTemplate),

    events: {
      "submit #project-form" : "post"
    },

    render: function () {
      this.$el.html(this.template);
    },

    post: function (e) {
      if (e.preventDefault) e.preventDefault();
      var data;

      data = {
        title       : this.$(".project-title-form").val(),
        description : this.$(".project-description-form").val()
      };

      this.collection.trigger("project:save", data);
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return ProjectFormView;

});
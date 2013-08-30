define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'projects_collection',
    'text!project_form_template'
], function ($, Bootstrap, _, Backbone, ProjectsCollection, ProjectFormTemplate) {
  'use strict';

  var ProjectFormView = Backbone.View.extend({
    
    template: _.template(ProjectFormTemplate),

    events: {
      "submit #project-form" : "post"
    },
    
    render: function () {
      this.$el.html(this.template)  
    },

    post: function (e) {
      if (e.preventDefault()) e.preventDefault();

      var title, description;

      // Serialize form.
      title       = $(".project-name", this.el).val();
      description = $(".project-description", this.el).val();

      this.collection.trigger("project:save", title, description);
    },

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return ProjectFormView;

});
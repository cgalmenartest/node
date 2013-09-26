define([
  'underscore',
  'backbone',
  'text!project_edit_form_template',
  'text!project_tag_template'
], function (_, Backbone, ProjectEditFormTemplate) {

  var ProjectEditFormView = Backbone.View.extend({

    events: {
      'submit #project-edit-form': 'edit'
    },

    el: "#container",

    render: function () {
      var self = this;

      var data = {
        data: self.model
      }

      var compiledTemplate = _.template(ProjectEditFormTemplate, data);
      this.$el.html(compiledTemplate);
    },

    edit: function (e) {
      if (e.preventDefault()) e.preventDefault();
      
      var data = {
        title: $("#project-edit-form-title").val(),
        description: $("#project-edit-form-description").val()
      }

      this.model.trigger("project:model:update", data);
    }

  });

  return ProjectEditFormView;
})
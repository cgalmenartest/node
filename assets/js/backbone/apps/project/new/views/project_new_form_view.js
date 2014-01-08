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
      "blur #project-form-title"      : "v",
      "blur #project-form-description": "v",
      "submit #project-form"          : "post"
    },

    render: function () {
      this.$el.html(this.template);
    },

    v: function (e) {
      return validate(e);
    },

    post: function (e) {
      if (e.preventDefault) e.preventDefault();

      // validate input fields
      var validateIds = ['#project-form-title', '#project-form-description'];
      var abort = false;
      for (i in validateIds) {
        var iAbort = validate({ currentTarget: validateIds[i] });
        abort = abort || iAbort;
      }
      if (abort === true) {
        return;
      }

      // process project form
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
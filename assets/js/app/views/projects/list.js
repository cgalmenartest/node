// TODO:
// This file is turning into more of a master layout for projects rather than 
// just a list view. Switch it up so that it is a /project.js show view as 
// opposed to list. Then instantiate list from there.  Then instantiate the show view
// from the list view.  Then instantiate the tasks collection from there.
// So on and so forth.

define([
  'jquery',
  'underscore',
  'backbone',
  '../../models/project',
  '../../collections/projects',
  '../../views/projects/show',
  'text!../../../../templates/projects/list.html',
  '../../views/projects/form'
], function ($, _, Backbone, ProjectModel, ProjectsCollection, ProjectShowView, projectListTemplate, ProjectForm) {
  'use strict';

  var ProjectListView = Backbone.View.extend({

    el: $("#container"),

    events: {
      "click .add-project": "add",
      "click .project"    : "show"
    },

    initialize: function (collection) {
      var _this           = this;
      this.isRendered     = false;
      this.showRendered   = false;
      this.collection     = collection;
      this.model          = new ProjectModel();

      app.events.on("project:render", function () { 
        _this.render();
      });
      this.render();
    },

    render: function () {
      var compiledTemplate = _.template(projectListTemplate, this.collection);
      this.$el.html(compiledTemplate).hide().fadeIn();

      app.events.on("project:render", function () {
        $(".modal a[href='#addProject']").modal('hide');
        $("body").removeClass("modal-open");
        $(".modal-backdrop").remove();
      })
    },

    add: function () {
      new ProjectForm({ model: this.model })
    },


    show: function (e) {
      if (this.showHasRendered) return;
      this.showHasRendered = true;

      var id, project, _this = this, el = e.currentTarget;

      if (e.preventDefault()) e.preventDefault();

      // Add a current class to then use to find the ID.
      // TODO: Remove the class. 
      $(el).addClass("current");
  
      // Get the model ID using the ID in the DOM.
      // Then instantiate a new project model passing in the ID to do a fetch()
      id = $(".project.current").parent().parent().parent().attr('data-project-id')

      $(".project-id").remove();
      var html = '<div class="project-id" style="display: none;">' +
                    id +
                '</div>';
        $("body").append(html);

      // Experimenting
      for (var i in this.model.attributes) { this.isNull = this.model.attributes[i] === null; }

      if (this.isNull) {
          this.model.destroy();
          this.model = new ProjectModel({ id: id });
          // window.location.hash = "#projects/" + id;

          // Trigger event for model to do fetching logic.
          this.model.trigger("project:show", id);
      } else {
          return;
      }

      app.events.on("projectShow:success", function (data, id) {
          new ProjectShowView({
              projectId: id,
              data: data
          })
      })
    }
  });

  return ProjectListView;
});
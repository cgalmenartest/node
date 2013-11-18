define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'utilities',
  'base_controller',
  'browse_main_view',
  'project_collection',
  'tasks_collection',
  'project_form_view',
  'modal_component'
], function (
  $, _, Backbone, Bootstrap, utils, BaseController,
  BrowseMainView, ProjectsCollection, TasksCollection,
  ProjectFormView, ModalComponent) {

  Application.Browse = {};

  Application.Browse.ListController = BaseController.extend({

    el: "#container",

    events: {
      "click .project-link"   : "showProject",
      "click .project-background-image" : "showProject",
      "click .task-link"      : "showTask",
      "click .task-box"       : "showTask",
      "click .add-project"    : "addProject",
      "click .add-opportunity": "addOpp"
    },

    initialize: function ( options ) {
      var self = this;
      this.target = this.options.target;
      this.fireUpCollection();
      this.initializeView();

      this.collection.trigger(this.target + ":fetch");

      this.listenTo(this.collection, "project:save:success", function (data) {
        Backbone.history.navigate('projects/' + data.attributes.id, { trigger: true });
      })
    },

    initializeView: function () {
      if (this.browseMainView) {
        this.browseMainView.cleanup();
      }
      this.browseMainView = new BrowseMainView({
        el: "#container",
        target: this.target,
        collection: this.collection
      }).render();
    },

    fireUpCollection: function () {
      var self = this;
      if (this.collection) {
        this.collection;
      } else {
        if (this.target == 'projects') {
          this.collection = new ProjectsCollection();
        }
        else if (this.target == 'tasks') {
          this.collection = new TasksCollection();
        }
        else {
          this.collection = new ProfilesCollection();
        }
      }
      this.listenToOnce(this.collection, this.target + ":fetch", function () {
        self.collection.fetch({
          success: function (collection) {
            self.collection = collection;
            self.browseMainView.renderList(self.collection.toJSON());
          }
        })
      })
    },

    // -----------------------
    //= BEGIN CLASS METHODS
    // -----------------------
    showProject: function (e) {
      if (e.preventDefault) e.preventDefault();
      var id = $($(e.currentTarget).parents('li.project-box')[0]).data('id');
      Backbone.history.navigate('projects/' + id, { trigger: true });
    },

    showTask: function (e) {
      if (e.preventDefault) e.preventDefault();
      var id = $(e.currentTarget).data('id') || $($(e.currentTarget).parents('li.task-box')[0]).data('id');
      Backbone.history.navigate('tasks/' + id, { trigger: true });
    },

    addProject: function (e) {
      if (e.preventDefault) e.preventDefault();
      var self = this;

      if (this.modalComponent) this.modalComponent;
      this.modalComponent = new ModalComponent({
        el: "#container",
        id: "addProject",
        modalTitle: "Add Project"
      }).render();

      if (!_.isUndefined(this.modalComponent)) {
        if (this.projectFormView) this.projectFormView();
        this.projectFormView = new ProjectFormView({
          el: ".modal-template",
          collection: self.collection
        }).render();
      }

    },

    addOpp: function (e) {
      if (e.preventDefault) e.preventDefault();
      console.log('Not yet implemented');
    },

    // ---------------------
    //= UTILITY METHODS
    // ---------------------
    cleanup: function() {
      if (this.browseMainView) { this.browseMainView.cleanup(); }
      removeView(this);
    }

  });

  return Application.Browse.ListController;
})
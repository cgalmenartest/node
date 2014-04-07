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
  'task_model',
  'project_form_view',
  'task_form_view',
  'modal_wizard_component',
  'modal_component'
], function (
  $, _, Backbone, Bootstrap, utils, BaseController,
  BrowseMainView, ProjectsCollection, TasksCollection, TaskModel,
  ProjectFormView, TaskFormView, ModalWizardComponent, ModalComponent) {

  Application.Browse = {};

  Application.Browse.ListController = BaseController.extend({

    events: {
      "click .project-link"   : "showProject",
      "click .project-background-image" : "showProject",
      "click .task-link"      : "showTask",
      "click .task-box"       : "showTask",
      "click .add-project"    : "addProject",
      "click .add-opportunity": "addTask"
    },

    initialize: function ( options ) {
      var self = this;
      // this.options = options;
      this.target = options.target;
      this.fireUpCollection();
      this.initializeView();

      this.collection.trigger('browse:' + this.target + ":fetch");

      this.listenTo(this.projectsCollection, "project:save:success", function (data) {
        // hide the modal
        $('#addProject').bind('hidden.bs.modal', function() {
          Backbone.history.navigate('projects/' + data.attributes.id, { trigger: true });
        }).modal('hide');
      });

      this.listenTo(this.tasksCollection, "task:save:success", function (data) {
        // hide the modal
        $('#addTask').bind('hidden.bs.modal', function() {
          Backbone.history.navigate('tasks/' + data, { trigger: true });
        }).modal('hide');
      });

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
      this.projectsCollection = new ProjectsCollection();
      this.tasksCollection = new TasksCollection();
      if (this.target == 'projects') {
        this.collection = this.projectsCollection;
      }
      else if (this.target == 'tasks') {
        this.collection = this.tasksCollection;
      }
      else {
        this.collection = new ProfilesCollection();
      }
      this.listenToOnce(this.collection, 'browse:' + this.target + ":fetch", function () {
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

      if (this.projectFormView) this.projectFormView.cleanup();
      if (this.modalComponent) this.modalComponent.cleanup();

      this.modalComponent = new ModalComponent({
        el: "#container",
        id: "addProject",
        modalTitle: "Add Project"
      }).render();

      this.projectFormView = new ProjectFormView({
        el: ".modal-template",
        collection: this.projectsCollection
      }).render();

    },

    addTask: function (e) {
      if (e.preventDefault) e.preventDefault();

      if (this.taskFormView) this.taskFormView.cleanup();
      if (this.modalWizardComponent) this.modalWizardComponent.cleanup();

      this.taskModel = new TaskModel();
      this.modalWizardComponent = new ModalWizardComponent({
        el: ".wrapper-addTask",
        id: "addTask",
        modalTitle: 'New Opportunity',
        model: this.taskModel,
        collection: this.tasksCollection,
        modelName: 'task',
        data: function (parent) { return {
          title: parent.$("#task-title").val(),
          description: parent.$("#task-description").val(),
          // these tasks are orphaned
          projectId: null
        } }
      }).render();

      this.taskFormView = new TaskFormView({
        el: "#addTask .modal-body",
        projectId: null,
        model: this.taskModel,
        tasks: this.tasksCollection
      }).render();
      this.modalWizardComponent.setChildView(this.taskFormView);
      this.modalWizardComponent.setNext(this.taskFormView.childNext);
      this.modalWizardComponent.setSubmit(this.taskFormView.childNext);
    },

    // ---------------------
    //= UTILITY METHODS
    // ---------------------
    cleanup: function() {
      if (this.taskFormView) { this.taskFormView.cleanup(); }
      if (this.modalWizardComponent) { this.modalWizardComponent.cleanup(); }
      if (this.projectFormView) { this.projectFormView.cleanup(); }
      if (this.modalComponent) { this.modalComponent.cleanup(); }
      if (this.browseMainView) { this.browseMainView.cleanup(); }
      removeView(this);
    }

  });

  return Application.Browse.ListController;
})
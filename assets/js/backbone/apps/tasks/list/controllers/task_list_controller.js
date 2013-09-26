define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'tasks_collection',
  'task_collection_view',
  'task_form_view',
  'modal_component'
], function ($, _, Backbone, Bootstrap, TasksCollection, TaskCollectionView, TaskFormView, ModalComponent) {
  'use strict';

  Application.Controller.TaskList = Backbone.View.extend({

    el: "#task-list-wrapper",

    events: {
      'click .add-task': 'add'
    },

    initialize: function (settings) {
      this.options = _.extend(settings, this.defaults);
      this.fireUpTasksCollection();
      this.requestTasksCollectionData();
    },

    fireUpTasksCollection: function () {
      if (this.collection) {
        this.collection.initialize();
      } else {
        this.collection = new TasksCollection();
      }
    },

    requestTasksCollectionData: function () {
      var self = this;

      this.collection.fetch({
        url: '/task/findAllByProjectId/' + parseInt(this.options.projectId),
        success: function (collection) {
          self.renderTaskCollectionView(collection)
        }
      });
    },

    renderTaskCollectionView: function (collection) {
      $(".modal-backdrop").hide();
      $(".modal").modal('hide');
        
      if (this.taskCollectionView) {
        this.taskCollectionView.cleanup();
      }
      this.taskCollectionView = new TaskCollectionView({
        el: "#task-list-wrapper",
        onRender: true,
        collection: collection
      });

    },

    add: function (e) {
      if (e.preventDefault()) e.preventDefault();

      if (this.modalComponent) this.modalComponent;
      this.modalComponent = new ModalComponent({
        el: "#task-list-wrapper",
        id: "addTask",
        modalTitle: 'Add Task'
      }).render();  

      if (!_.isUndefined(this.modalComponent)) {
        if (this.taskFormView) this.taskFormView;
        this.taskFormView = new TaskFormView({
          el: ".modal-template",
          projectId: this.options.projectId
        }).render();  
      }
      
    },

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return Application.Controller.TaskList;
})
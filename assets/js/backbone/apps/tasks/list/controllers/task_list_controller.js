define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'tasks_collection',
  'task_collection_view',
  'task_form_view'
], function ($, _, Backbone, Bootstrap, TasksCollection, TaskCollectionView, TaskFormView) {
  'use strict';

  Application.Controller.TaskList = Backbone.View.extend({

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
        url: '/task/findAllByProject/' + parseInt(this.options.projectId),
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
        el: ".task-list-wrapper",
        onRender: true,
        collection: collection
      });

        if (this.taskFormView) {
          this.taskFormView.remove();
        }
        this.taskFormView = new TaskFormView({
          el: "#task-form-wrapper",
          projectId: this.options.projectId
        }).render();
    },

    cleanup: function () {
      $(this.el).remove();
    }

  });

  return Application.Controller.TaskList;
})
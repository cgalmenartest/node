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
      
    el: ".task-list-wrapper",

    events: {
      "click .task": "show"
    },

    initialize: function (settings) {
      _.bindAll(this, 'cleanup');
      this.options = _.extend(settings, this.defaults);

      this.rendered = true;
      this.fireUpTasksCollection();
      this.requestTasksCollectionData();
      this.initializeTaskFetchListeners();
    },

    fireUpTasksCollection: function () {
      if (this.collection) {
        this.collection.initialize();
      } else {
        this.collection = new TasksCollection();
      }
    },

    requestTasksCollectionData: function () {
      entities.request.trigger("tasks:fetch", this.options.projectId);
    },

    initializeTaskFetchListeners: function () {
      var self = this;

      this.listenTo(entities.request, "tasks:fetch:success", function (collection) {
        // @collection instance variable.
        self.collection = collection;
        self.renderTaskCollectionView();
      });
    },

    renderTaskCollectionView: function () {
      $(".modal-backdrop").hide();
      $(".modal").modal('hide');
      
      this.taskCollectionView ?
        this.taskCollectionView.render() :
        this.taskCollectionView = new TaskCollectionView({
          el: ".task-list-wrapper",
          onRender: true,
          collection: this.collection
        }).render();
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
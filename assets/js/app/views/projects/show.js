define([
  'jquery',
  'underscore',
  'backbone',
  '../../collections/tasks',       
  'text!../../../../templates/projects/show.html'
], function ($, _, Backbone, TaskCollection, projectShowTemplate) {
  'use strict';

  var ProjectShowView = Backbone.View.extend({

    el: $("#container"),

    initialize: function (data) {
      this.isRendered = false;
      this.render(data);
    },

    render: function (data) {
      if (this.isRendered) return;
      this.isRendered = true;
      
      var compiledTemplate, 
      id = data.projectId;
      // merge this data object with an object for tasks.

      this.collection = new TaskCollection(id);
      this.collection.url = '/task/findAllByProject?projectId=' + id;
      this.collection.fetch();

      compiledTemplate = _.template(projectShowTemplate, data);
      this.$el.html(compiledTemplate).hide().fadeIn();
    }
      
  });

  return ProjectShowView;
});
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

        initialize: function (data, id) {
            this.isRendered = false;
            this.render(data, id);
        },

        render: function (data, id) {
            if (this.isRendered) return;
            this.isRendered = true;
            
            var compiledTemplate, 
            id = $(".project.current").parent().attr("data-project-id");
            // merge this data object with an object for tasks.

            this.collection = new TaskCollection();
            this.collection.url = '/task/findAllByProject?projectId=' + id;
            this.collection.fetch();

            compiledTemplate = _.template(projectShowTemplate, data);
            this.$el.html(compiledTemplate).hide().fadeIn();
        }
        
    });

    return ProjectShowView;
});
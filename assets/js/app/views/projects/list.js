define([
    'jquery',
    'underscore',
    'backbone',
    // '../../collections/projects',
    '../../models/project',
    '../../collections/projects',
    'text!../../../../templates/projects/list.html'
], function ($, _, Backbone, ProjectModel, ProjectsCollection, projectListTemplate) {
    'use strict';

    var ProjectListView = Backbone.View.extend({

        el: $("#container"),

        events: {
            "submit #project-form": "post",
            "click .project": "navigateToProjectShow"
        },  

        initialize: function (collection) {
            // Allow for global access
            this.collection = collection;

            this.model = new ProjectModel();
            this.render();
        },

        render: function () {
            var compiledTemplate, data, _collection;

            // Local instance, remove in refactor
            _collection = this.collection;

            compiledTemplate = _.template(projectListTemplate, _collection);

            this.$el.append(compiledTemplate).hide().fadeIn();
            return this;
        },

        post: function (event) {
            if (event.preventDefault()) event.preventDefault();
            
            // Trigger event model to handle the next steps
            this.model.trigger("project:post");
        },

        navigateToProjectShow: function (event) {
            console.log($(this.currentTarget));
        }
        
    });

    return ProjectListView;
});
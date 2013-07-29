// TODO:
// This file is turning into more of a master layout for projects rather than 
// just a list view. Switch it up so that it is a /project.js show view as 
// opposed to list. Then instantiate list from there.  

define([
    'jquery',
    'underscore',
    'backbone',
    '../../models/project',
    '../../collections/projects',
    '../../views/projects/show',
    'text!../../../../templates/projects/list.html'
], function ($, _, Backbone, ProjectModel, ProjectsCollection, ProjectShowView, projectListTemplate) {
    'use strict';

    var ProjectListView = Backbone.View.extend({

        el: $("#container"),

        events: {
            "submit #project-form": "post",
            "click .project": "show"
        },  

        initialize: function (collection) {
            // Allow for global access
            this.collection = collection;
            this.model = new ProjectModel();
            this.render();
        },

        render: function () {
            var compiledTemplate;
            compiledTemplate = _.template(projectListTemplate, this.collection);
            this.$el.html(compiledTemplate).hide().fadeIn();
        },

        post: function (e) {
            e.preventDefault();

            var title, description;

            title       = $(".project-name").val();
            description = $(".project-description").val();

            this.model.trigger("project:post", title, description);
        },

        show: function (e) {
            var id, project, _this = this, el = e.currentTarget;

            if (e.preventDefault()) e.preventDefault();

            // Add a current class to then use to find the ID.
            // TODO: Remove the class. 
            $(el).addClass("current");

            // Get the model ID using the ID in the DOM.
            // Then instantiate a new project model passing in the ID to do a fetch()
            id          = $(".project.current").parent().attr('data-project-id')
            this.model  = new ProjectModel({ id: id });

            // Trigger event for model to do fetching logic.
            this.model.trigger("project:show");

            app.events.on("projectShow:success", function (data) {
                new ProjectShowView({
                    data: data
                })
            })
            

        }
        
    });

    return ProjectListView;
});
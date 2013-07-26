define([
    'jquery',
    'underscore',
    'backbone',
    '../../collections/projects',
    'text!../../../../templates/projects/list.html'
], function ($, _, Backbone, ProjectsCollection, projectListTemplate) {
    'use strict';

    var ProjectListView = Backbone.View.extend({

        el: $("#container"),

        events: {
            "submit #project-form": "add"
        },

        initialize: function () {
            _.bindAll(this, 'render');

            this.collection = new ProjectsCollection();
            this.collection.on("add", this.render, this);

            this.addProjectsDataShim();
            this.render();
        },

        addProjectsDataShim: function () {
            // Shim data to get a user started.
            this.collection.add({ name: "Project 1", description: "Project 1 description" });
            this.collection.add({ name: "Project 2", description: "Project 2 description" });
            this.collection.add({ name: "Project 3", description: "Project 3 description" });
            
            // Add nested models.  (tasks belong_to :project, and project has_many :tasks)
            this.collection.models[0].set("tasks", { name: "Project 1 task #1" });
            this.collection.models[1].set("tasks", { name: "Project 2 task #1" });
            this.collection.models[2].set("tasks", { name: "Project 3 task #1" })
        },

        render: function () {
            // We can put the template up top as per backbone standards IE 
            // template: _.template(projectListTemplate),
            // BUT the collection is instantiated after initialize method, so we need to add this
            // 'mixin' of data after the fact.  The following is a good way to do so.
            // _.extend(template, { projects: this.collection.toJSON() })
            // Actually, on second thought that may not work because _.template is a function not a simple
            // object.  So we'd have to mixin the inner-object.  I'll see how we could do that later.  

            var compiledTemplate, data;

            data = { projects: this.collection.toJSON() }
            compiledTemplate = _.template(projectListTemplate, data);

            this.$el.html(''); // Either this or append is fine.
            this.$el.append(compiledTemplate).hide().fadeIn();
        },

        add: function (event) {
            var data;

            if (event.preventDefault()) event.preventDefault();
            data = {
                name        : $(event.currentTarget).children('.project-name').val(),
                description : $(event.currentTarget).children('.project-description').val()
            }

            this.collection.add(data);
        }
        
    });

    return ProjectListView;
});
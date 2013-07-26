define([
    'underscore',
    'backbone',
    '../collections/tasks'
], function (_, Backbone, TasksCollection) {
    'use strict';
    
    var ProjectModel = Backbone.Model.extend({

        defaults: {
            name        : null,
            description : null
            // tasks: {}
            // has_many :tasks.
            // We don't want to put nested objects in the attributes
            // in a typical JS fashion, as that will run into object
            // literals behaving strangely as they aren't directly tied 
            // to Backbone conventions, in the initialize method below we are 
            // doing it in a much more Backbone-esque fashion.
        },

        initialize: function () {

            // Check if the tasks model is empty coming from server,
            // and if it is then fill up with tasks in server.
            // If it is empty instantiate new tasks collection.
            if (this.get("tasks") === undefined || this.get("tasks").length === 0) {
                this.set("tasks", new TasksCollection())
            } else {
                this.set("tasks", new TasksCollection(this.get("tasks")));
            }
            
            // Implementation of a change event for view
            // Helps with changing 'live' after server fetch or on new
            // instantiation.
            this.get("tasks").on('change', function () {
                this.trigger('change');
            }, this);
        }

    });

    return ProjectModel;
});
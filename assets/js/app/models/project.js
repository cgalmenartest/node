define([
    'underscore',
    'backbone'
    // '../collections/tasks'
], function (_, Backbone) {
    'use strict';
    
    var ProjectModel = Backbone.Model.extend({

        defaults: {
            title       : null,
            description : null
            // tasks: {}
            // has_many :tasks.
            // We don't want to put nested objects in the attributes
            // in a typical JS fashion, as that will run into object
            // literals behaving strangely as they aren't directly tied 
            // to Backbone conventions, in the initialize method below we are 
            // doing it in a much more Backbone-esque fashion.
        },

        // Override the default way Backbone handles URL's for rails. 
        // Setting it up for multiple methods on each route (controller) endpoint.
        methodToURL: {
            'create': '/project/create',
            'update': '/project/update'
        },

        sync: function(method, model, options) {
            options = options || {};
            options.url = model.methodToURL[method.toLowerCase()];

            Backbone.sync(method, model, options);
        },

        initialize: function () {
            _.extend(this, Backbone.Events);
            this.initializeModelSave();
        },

        initializeModelSave: function () {
            var _this = this;

            this.on("project:post", function () {
                // In refactor change this to use the backbone model.set() 
                // method, and pass in this, to _this.save(this, {success: }.. etc
                var title       = $(".project-name").val();
                var description = $(".project-description").val();

                _this.save({
                    title: title,
                    description: description
                }, { success: function () {
                    // Implement this event trigger in the view.
                    Backbone.Events.trigger("project:success");
                }, error: function () {
                    // Implement this event trigger in the view.
                    Backbone.Events.trigger("project:error")
                    }
                });
            });
        }

        // ARCHIVED FOR NOW.

        // Check if the tasks model is empty coming from server,
        // and if it is then fill up with tasks in server.
        // If it is empty instantiate new tasks collection.
        // if (this.get("tasks") === undefined || this.get("tasks").length === 0) {
        //     this.set("tasks", new TasksCollection())
        // } else {
        //     this.set("tasks", new TasksCollection(this.get("tasks")));
        // }
        
        // Implementation of a change event for view
        // Helps with changing 'live' after server fetch or on new
        // instantiation.
        // this.get("tasks").on('change', function () {
        //     this.trigger('change');
        // }, this);

    });

    return ProjectModel;
});
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
        },

        // Commented out due to experimentation with a more semantic urlRoot methodology:
        // Override the default way Backbone handles URL's for rails. 
        // Setting it up for multiple methods on each route (controller) endpoint.
        // methodToURL: {
        //     'create': '/project/create',
        //     'update': '/project/update'
        // },

        // sync: function(method, model, options) {
        //     options = options || {};
        //     options.url = model.methodToURL[method.toLowerCase()];

        //     Backbone.sync(method, model, options);
        // },

        initialize: function () {
            _.extend(this, Backbone.Events);
            this.initializeModelSave();
            this.initializeProjectShow();
        },

        urlRoot: '/project',
 
        initializeModelSave: function () {
            var _this = this;

            this.on("project:post", function (title, description) {
                _this.save({
                    title: title,
                    description: description
                }, { success: function () {
                        // Implement this event trigger in the view.
                        app.events.trigger("project:success");
                    }, error: function () {
                        // Implement this event trigger in the view.
                        app.events.trigger("project:error")
                    }
                });
            });
        },

        initializeProjectShow: function () {
            this.on("project:show", function (id) {
                console.log(id);
                this.fetch({
                    success: function (data, id) { 
                        app.events.trigger("projectShow:success", data);
                    }
                });
            })
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
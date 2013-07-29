define([
    'jquery',
    'underscore',
    'backbone',
    'views/marketing/home',
    'collections/projects',
    'views/tasks/list'
], function ($, _, Backbone, HomeView, ProjectsCollection, TaskListView) {
    'use strict';
    
    var AppRouter = Backbone.Router.extend({

        // This is really just an API Manager, perhaps the name
        // should be changed to reflect that.  

        routes: {
            // Expects #/api/home, etc .....
            'api/home'          : 'home',
            'api/projects'      : 'listProjects',
            'api/projectShow'   : 'projectShow',
            'api/tasks'         : 'listTasks',
            '*actions'          : 'defaultAction'
        },

        home: function () {
            console.log("Initializing home view");
            new HomeView();
        },

        listProjects: function () {
            console.log("Initializing projects collection and view");
            this.collection = new ProjectsCollection();
            this.collection.fetch();
        },

        projectShow: function () {
            console.log("Initializing project show view");
        },

        listTasks: function () {
            console.log("Initializing tasks view");
            new TaskListView();
        }
    });

    var initialize = function () {
        var router = new AppRouter();
        Backbone.history.start();

        router.on('defaultAction', function (actions) {
            console.log("no route:", actions);
        });
    }

    return {
        initialize: initialize
    }
});
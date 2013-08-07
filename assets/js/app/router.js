define([
    'jquery',
    'underscore',
    'backbone',
    'views/marketing/home',
    'collections/projects',
    'collections/tasks',
    'views/tasks/list'
], function ($, _, Backbone, HomeView, ProjectsCollection, TasksCollection, TaskListView) {
    'use strict';
    
    var AppRouter = Backbone.Router.extend({

        routes: {
            // Expects #/api/home, etc .....
            ''                  : 'home',
            'api/home'          : 'home',
            'api/projects'      : 'listProjects',
            '*actions'          : 'defaultAction'
        },

        home: function () {
            console.log("Initializing home view");
            new HomeView();
        },

        listProjects: function () {
            if (!this.collection) {
                this.collection = new ProjectsCollection();
            }
            this.collection.fetch();
        },

        projectShow: function () {
            console.log("Initializing project show view");
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
define([
    'jquery',
    'underscore',
    'backbone',
    'views/marketing/home',
    'views/projects/list'
], function ($, _, Backbone, HomeView, ProjectListView) {
    'use strict';
    
    var AppRouter = Backbone.Router.extend({

        // This is really just an API Manager, perhaps the name
        // should be changed to reflect that.  

        routes: {
            // Expects #/home, etc .....
            'api/home'      : 'home',
            'api/projects'  : 'listProjects',
            '/tasks'     : 'listTasks',
            '*actions'      : 'defaultAction'
        },

        home: function () {
            console.log("Initializing home view");
            new HomeView();
        },

        listProjects: function () {
            console.log("Initializing projects view");
            new ProjectListView();
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
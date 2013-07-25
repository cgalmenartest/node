define([
    'jquery',
    'underscore',
    'backbone',
    'home'
], function ($, _, Backbone, HomeView) {
    'use strict';
    
    var AppRouter = Backbone.Router.extend({

        // This is really just an API Manager, perhaps the name
        // should be changed to reflect that.  

        routes: {
            // Expects #/api/...
            'api/home'      : 'home',
            'api/projects'  : 'listProjects',
            'api/tasks'     : 'listTasks',
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
// Globals and Constants
window.app          = {};
app.events          = {};
window.activeViews  = [];

// Require setup and config
require.config({
    
    paths: {

        // ----------
        //= Vendor
        // ----------
        'jquery'            : '../vendor/jquery',
        'dropzone'          : '../vendor/dropzone-amd-module',
        'underscore'        : '../vendor/underscore',
        'backbone'          : '../vendor/backbone',
        'bootstrap'         : '../vendor/bootstrap',

        // ----------
        //= Collections
        // ----------
        'CommentsCollection': 'collections/comments',
        'ProjectsCollection': 'collections/projects',
        'TasksCollection'   : 'collections/tasks',
        
        // ----------
        //= Models
        // ----------
        'CommentModel'      : 'models/comment',
        'ProfileModel'      : 'models/profile',
        'ProjectModel'      : 'models/project',
        'TaskModel'         : 'models/task',

        // ----------
        //= Views#comments
        // ----------
        'CommentItemView'   : 'views/comments/comment',
        'CommentFormView'   : 'views/comments/form',
        'CommentListView'   : 'views/comments/list',

        // ----------
        //= Views#marketing
        // ----------
        'MarketingHomeView' : 'views/marketing/home',
        
        // ----------
        //= Views#profile
        // ----------
        'ProfileShowView'   : 'views/profile/show',
        
        // ----------
        //= Views#project
        // ----------
        'ProjectFormView'   : 'views/projects/form',
        'ProjectListView'   : 'views/projects/list',
        'ProjectShowView'   : 'views/projects/show',

        // ----------
        //= Views#task
        // ----------
        'TaskFormView'      : 'views/tasks/form',
        'TaskListView'      : 'views/tasks/list',
        'TasksMasterLayout' : 'views/tasks/TasksMasterLayout',
        
        // ----------
        //= Router
        // ----------
        'router': 'router'
    }
});

// Require injection and beginning of backbone
define([
    'jquery',
    'underscore',
    'backbone',
    'router'
], function ($, _, Backbone, Router) {

    // Commonly used 'global' methods and jQuery addons 

    // Extend the backbone.events object and mixin our own for customization
    _.extend(app.events, Backbone.Events);

    // Backbone entry point
    Router.initialize();
});
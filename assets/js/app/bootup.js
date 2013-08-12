// Globals and Constants
window.app  = {};
app.events  = {};

// Require setup and config
require.config({
    paths: {
        'jquery': '../vendor/jquery',
        'dropzone': '../vendor/dropzone-amd-module',
        'underscore': '../vendor/underscore',
        'backbone': '../vendor/backbone',
        'bootstrap': '../vendor/bootstrap',
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
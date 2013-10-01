require.config({
    paths: {
        'underscore': '../vendor/underscore-amd/underscore',
        'backbone': '../vendor/backbone-amd/backbone'
    }
});

define([
    'underscore',
    'backbone',
    'router'
], function (_, Backbone, Router) {
    Router.initialize();
});
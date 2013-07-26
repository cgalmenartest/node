// On prod compile everything down and roll it up to this file, so 
// the use strict is applied globally from this point onward.
// Use grunt to compile dev for this purpose.  DRY use strict.

require.config({
    paths: {
        'jquery': '../vendor/jquery',
        'underscore': '../vendor/underscore',
        'backbone': '../vendor/backbone',
        'router': 'router'
    }
});

define([
    'jquery',
    'underscore',
    'backbone',
    'router'
], function ($, _, Backbone, Router) {
    Router.initialize();
});
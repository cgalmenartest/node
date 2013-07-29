define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';
    
    var TaskModel = Backbone.Model.extend({

        defaults: {
            name        : null,
            description : null
        },

        url: '/tasks',

        initialize: function () {}

    });

    return TaskModel;
});
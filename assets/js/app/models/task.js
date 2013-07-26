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

        initialize: function () {}

    });

    return TaskModel;
});
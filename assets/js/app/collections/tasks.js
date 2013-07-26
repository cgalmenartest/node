define([
    'underscore',
    'backbone',
    'taskModel'
], function (_, Backbone, TaskModel) {
    'use strict';

    var TasksCollection = Backbone.Collection.extend({
        model: TaskModel
    });

    return TasksCollection;
});
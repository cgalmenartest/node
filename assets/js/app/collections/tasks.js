define([
    'underscore',
    'backbone',
    '../models/task'
], function (_, Backbone, TaskModel) {
    'use strict';

    var TasksCollection = Backbone.Collection.extend({
        model: TaskModel,
        url: '/tasks'
    });

    return TasksCollection;
});
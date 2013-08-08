define([
    'underscore',
    'backbone',
    '../models/task',
    '../views/tasks/list'
], function (_, Backbone, TaskModel, TaskListView) {
    'use strict';

    var TasksCollection = Backbone.Collection.extend({
        
        model: TaskModel,
        
        url: '/task/findAllByProject',

        initialize: function () {},

        parse: function (response) {
            new TaskListView({ tasks: response.tasks });
        }

    });

    return TasksCollection;
});
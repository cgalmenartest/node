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

        initialize: function (id) {
            var html = '<div class="project-id" style="display: none;">' +
                            id +
                        '</div>';

            $("body").append(html)
        },

        parse: function (response) {
            new TaskListView({ tasks: response.tasks });
        }

    });

    return TasksCollection;
});
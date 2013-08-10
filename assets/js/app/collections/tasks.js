define([
    'underscore',
    'backbone',
    '../models/task',
    '../views/tasks/list'
], function (_, Backbone, TaskModel, TaskListView) {
    'use strict';

    var TasksCollection = Backbone.Collection.extend({
        
        model: TaskModel,
        
        initialize: function (projectObject) {
            this.id = projectObject.id;
            var _this = this;
            app.events.on("taskSave:success", function () {
                _this.fetch();
                app.events.trigger("task:render");
            })
        },

        url: function () {
            return '/task/findAllByProject/' + this.id
        },

        parse: function (response) {
            new TaskListView({ tasks: response.tasks });
        },

        validate: function (attrs) {
            app.events.on("taskSave:success", function (data) {
                if (data.attributes.title === "" && data.attributes.description === "") {
                    alert("Please enter a name and description");
                    this.pop();
                } else if (data.attributes.name === "") {
                    alert("Please enter a name");
                    this.pop();
                } else if (data.attributes.description === "") {
                    alert("Please enter a description");
                    this.pop();
                }
            });
        }

    });

    return TasksCollection;
});
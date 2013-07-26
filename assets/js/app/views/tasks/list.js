define([
    'jquery',
    'underscore',
    'backbone',
    'collections/tasks',
    'text!../../../../../templates/tasks/list.html'
], function ($, _, Backbone, TasksCollection, TaskListTemplate) {
    'use strict';

    var TaskListView = Backbone.View.extend({
        
        el: $("#container"),

        initialize: function () {
            this.collection = new TasksCollection();
            this.collection.fetch();
            this.collection.on("add", this.render, this);

            this.addTasksDataShim();
            this.render();
        },

        addTasksDataShim: function () {
            this.collection.add({ name: 'test'})
            this.collection.add({ name: 'test2'})
            this.collection.add({ name: 'test3'})
        },

        render: function () {
            var template, data;

            data = { tasks: this.collection.toJSON() }
            template = _.template(TaskListTemplate, data);
            
            this.$el.html(template).hide().fadeIn();
        }

    });

    return TaskListView;
})
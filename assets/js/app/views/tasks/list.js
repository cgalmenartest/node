define([
    'jquery',
    'underscore',
    'backbone',
    'models/task',
    'text!../../../../../templates/tasks/list.html'
], function ($, _, Backbone, TaskModel, TaskListTemplate) {
    'use strict';

    var TaskListView = Backbone.View.extend({
        
        el: $("#container"),

        events: {
            "#task-form submit": "post"
        },

        initialize: function (data) {
            this.render(data);
        },

        render: function (data) {
            var template = _.template(TaskListTemplate, data);
            this.$el.append(template).hide().fadeIn();
            return this;
        },

        post: function (e) {
            var title, description, projectId;

            if (e.preventDefault()) e.preventDefault();

            this.model = new TaskModel();

            title       = $("#task-title").val();
            projectId   = $(".project.current").parent().attr('data-project-id');
            description = $("#task-description").val()

            this.model.trigger("task:save", projectId, title, description);
        }

    });

    return TaskListView;
})
define([
    'jquery',
    'underscore',
    'backbone',
    '../../views/projects/list',
    'text!../../../../templates/projects/show.html'
], function ($, _, Backbone, ProjectList, projectShowTemplate) {
    'use strict';

    var ProjectShowView = Backbone.View.extend({

        el: $("#container"),

        initialize: function (data) {
            this.render(data);
        },

        render: function (data) {
            console.log(data);
            
            var compiledTemplate;
            compiledTemplate = _.template(projectShowTemplate, data);

            this.$el.html(compiledTemplate).hide().fadeIn();
        },

        back: function (event) {
            var l = ProjectList.new();
            l.render();
        }   
        
    });

    return ProjectShowView;
});
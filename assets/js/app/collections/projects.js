define([
    'underscore',
    'backbone',
    '../models/project',
    '../views/projects/list'
], function (_, Backbone, ProjectModel, ProjectView) {
    'use strict';
    
    var ProjectCollection = Backbone.Collection.extend({
        
        model: ProjectModel,

        url: '/project/findAll',

        parse: function (response) {
            new ProjectView({ projects: response.projects });
        },

        initialize: function () {
            var _this = this;
            app.events.on("projectSave:success", function () {
                _this.fetch();
                app.events.trigger("project:render");
            })
            // this.validate();
        },
        
        validate: function (attrs) {
            this.on("add", function (data) {
                if (data.attributes.name === "" && data.attributes.description === "") {
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

    return ProjectCollection;
});
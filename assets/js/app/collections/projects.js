define([
    'underscore',
    'backbone',
    '../models/project',
    '../views/projects/list'
], function (_, Backbone, ProjectModel, ProjectView) {
    'use strict';
    
    var ProjectCollection = Backbone.Collection.extend({
        
        model: ProjectModel,

        // My own implementation of a findAll method in Sails.  
        url: '/project/findAll',

        parse: function (response) {
            new ProjectView({ projects: response.projects });
        }

        // initialize: function () {
        //     this.validate();
        // },
        
        // // This is not the best way to do collection based validation.
        // // Because we are doing collection adding dynamically though, model
        // // validation is much more difficult.  So instead, doing it this way
        // // saves time.  Though, not super happy with this code.  Dynamically removing
        // // last model in array if validation fails - gross.
        // validate: function (attrs) {
        //     this.on("add", function (data) {
        //         if (data.attributes.name === "" && data.attributes.description === "") {
        //             alert("Please enter a name and description");
        //             this.pop();
        //         } else if (data.attributes.name === "") {
        //             alert("Please enter a name");
        //             this.pop();
        //         } else if (data.attributes.description === "") {
        //             alert("Please enter a description");
        //             this.pop();
        //         }
        //     });
        // }
    });

    return ProjectCollection;
});
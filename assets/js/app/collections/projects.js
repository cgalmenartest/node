define([
    'underscore',
    'backbone',
    '../models/project'
], function (_, Backbone, ProjectModel) {
    'use strict';
    
    var ProjectCollection = Backbone.Collection.extend({
        model: ProjectModel,

        initialize: function () {
            this.validate();
        },
        
        // This is not the best way to do collection based validation.
        // Because we are doing collection adding dynamically though, model
        // validation is much more difficult.  So instead, doing it this way
        // saves time.  Though, not super happy with this code.  Dynamically removing
        // last model in array if validation fails - gross.
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
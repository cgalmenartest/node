define([
  'underscore',
  'backbone',
  '../collections/tasks'
], function (_, Backbone) {
  'use strict';
  
  var ProjectModel = Backbone.Model.extend({

    defaults: {
      title       : null,
      description : null,
      archived    : false
    },

    initialize: function () {
      _.extend(this, Backbone.Events);
      this.initializeModelSave();
      this.initializeProjectShow();
    },  

    url: '/project',

    initializeModelSave: function () {
      var _this = this;

      this.on("project:updateWithPhotoId", function(file) {
        _this.save({
          coverId: file['id']
        }, {
        success: function (data) {
          _this.trigger("project:updatedPhoto", data);
        },
        error: function (data) {
          console.log(data);
        }
        });
      });
    },

    initializeProjectShow: function () {
      this.on("project:show", function () {
        this.fetch({
          success: function (data) { 
            app.events.trigger("projectShow:success", data);
          }
        });
      })
    }
    
  });

  return ProjectModel;
});
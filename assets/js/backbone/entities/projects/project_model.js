define([
  'underscore',
  'backbone',
], function (_, Backbone) {
  'use strict';
  
  var ProjectModel = Backbone.Model.extend({

    defaults: {
      title       : null,
      description : null,
      archived    : false
    },

    initialize: function () {
      this.initializeProjectFetchListener();
      this.initializePhotoSaveListener();
    },

    urlRoot: '/project',

    initializeProjectFetchListener: function () {
      var self = this;

      this.listenTo(this, "project:model:fetch", function (id) {
        self.get(id);
      });
    },

    get: function (id) {
      var self = this;

      this.fetch({ id: id,
        success: function (data) {
          self.trigger("project:model:fetch:success", data);
        }
      })
    },

    initializePhotoSaveListener: function () {
      var self = this;

      this.listenTo(this, "project:update:photoId", function(file) {
        self.save({
          coverId: file['id']
          }, {
          success: function (data) {
            self.trigger("project:updated:photo:success", data);
          }
        });
      });
    }

    // initializeModelSave: function () {
    //   var _this = this;


    // initializeProjectShow: function () {
    //   this.on("project:show", function () {
    //     this.fetch({
    //       success: function (data) { 
    //         app.events.trigger("projectShow:success", data);
    //       }
    //     });
    //   })
    // }
    
  });

  return ProjectModel;
});
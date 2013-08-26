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
    }

    // initializeModelSave: function () {
    //   var _this = this;

    //   this.on("project:updateWithPhotoId", function(file) {
    //     _this.save({
    //       coverId: file['id']
    //     }, {
    //     success: function (data) {
    //       _this.trigger("project:updatedPhoto", data);
    //     },
    //     error: function (data) {
    //       console.log(data);
    //     }
    //     });
    //   });
    // },

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
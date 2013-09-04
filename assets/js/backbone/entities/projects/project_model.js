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
      this.initializeProjectUpdateListener();
      this.initializePhotoSaveListener();
    },

    urlRoot: '/project',

    initializeProjectFetchListener: function () {
      var self = this;

      this.listenTo(this, "project:model:fetch", function (id) {
        self.get(id);
      });
    },

    initializeProjectUpdateListener: function () {
      var self = this;
      this.listenTo(this, "project:model:update", function (data) {
        self.update(data);
      });
    },

    update: function (data) {
      var self = this;

      this.save({ 
        title: data['title'],
        description: data['description']
      }, { success: function (returnModel) {
          self.trigger("project:save:success");
        }
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

  });

  return ProjectModel;
});
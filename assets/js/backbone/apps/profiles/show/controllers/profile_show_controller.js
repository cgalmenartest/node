define([
  'jquery',
  'underscore',
  'backbone',
  'base_controller',
  'profile_model',
  'profile_show_view'
], function ($, _, Backbone, BaseController, ProfileModel, ProfileView) {

  Application.Controller.Profile = BaseController.extend({

    // Here we are defining wether or not this is a full-region object
    // or a sub-region of another region.
    region: true,
    subRegion: false,

    el: "#container",

    events: {
    },

    initialize: function (options) {
      this.id = options.id;
      this.routeId = options.id;
      this.data = options.data;
      this.initializeProfileModelInstance();
    },

    initializeProfileModelInstance: function () {
      var self = this;

      if (this.model) this.model.remove();
      this.model = new ProfileModel();
      var fetchId = null;
      if (this.id && this.id != 'edit') { fetchId = this.id; }
      this.model.trigger("profile:fetch", fetchId);
      this.listenTo(this.model, "profile:fetch:success", function (model) {
        // @instance
        self.model = model;
        var modelJson = model.toJSON();
        for (i in modelJson.tags) {
          if (modelJson.tags[i].tag.type == 'agency') {
            self.model.agency = modelJson.tags[i].tag;
            self.model.agency['tagId'] = modelJson.tags[i].id;
          }
          else if (modelJson.tags[i].tag.type == 'location') {
            self.model.location = modelJson.tags[i].tag;
            self.model.location['tagId'] = modelJson.tags[i].id;
          }
        }
        self.initializeProfileViewInstance();
      });
    },

    initializeProfileViewInstance: function () {
      if (this.profileView) { this.profileView.cleanup(); }
      this.profileView = new ProfileView({
        el: this.$el,
        model: this.model,
        routeId: this.routeId,
        data: this.data
      }).render();
    },

    cleanup: function() {
      if (this.profileView) { this.profileView.cleanup(); }
      removeView(this);
    }

  });

  return Application.Controller.Profile;
})
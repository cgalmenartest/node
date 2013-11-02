define([
  'jquery',
  'underscore',
  'backbone',
  'profile_show_controller'
], function ($, _, Backbone, ProfileController) {

  var ProfileRouter = Backbone.Router.extend({

    // data to be passed back and forth between the
    // profile controller, views, and the router
    data: { saved: false },

    routes: {
      'profile(/)'            : 'profile',
      'profile/:id(/)'        : 'profile'
    },

    profile: function (id) {
      if (this.profileController) {
        this.profileController.cleanup();
      }
      this.profileController = new ProfileController({ id: id, data: this.data });
    }
  });

  var initialize = function () {
    var router = new ProfileRouter();
    return router;
  } 

  return {
    initialize: initialize
  };
});
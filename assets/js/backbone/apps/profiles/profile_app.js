define([
  'jquery',
  'underscore',
  'backbone',
  'profile_show_controller'
], function ($, _, Backbone, ProfileController) {

  var ProfileRouter = Backbone.Router.extend({

    routes: {
      'user': 'profile'
    },

    profile: function () {
      if (this.profileController) {
        this.profileController.cleanup();
      }
      this.profileController = new ProfileController();
    }
  });

  var initialize = function () {
    var router = new ProfileRouter();
  } 

  return {
    initialize: initialize
  };
});
define([
  'jquery',
  'underscore',
  'backbone',
  'browse_app'
], function ($, _, Backbone, BrowseApp) {

  var initialize = function () {
    var router, browse;

    // Here we are going to fire up all the routers for our app to listen
    // in on their respective applications.  We are -testing- this functionality
    // by using the profile application as a starting point (very simple, 1 route).
    browse = BrowseApp.initialize();

    Backbone.history.start({ pushState: true });
  } 

  return {
    initialize: initialize
  };
});
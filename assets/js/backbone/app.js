// Set and 'cache' global Application object.
window.Application = window.Application || {};

// Set up the global req res || pub/sub handler.
window.entities = {};

window.dispatcher 

// Set up the sub-objects within the Application object.
// These need to stay out of the flow of the application itself.
Application.AppModule = {};
Application.Controller = {};
Application.Component = {};

// Set up req
entities.request = {};

rendering = {}

define([
  'underscore',
  'backbone',
  'apps_router'
], function (_, Backbone, AppsRouter) {

  Application = {

    started: null,

    // Initialize and fire up the application.
  	initialize: function () {
      var self = this;

      // Mixin backbone events into our pub sub handler
      _.extend(entities.request, Backbone.Events);
      
      // Mixin backbone events into our rendering event handler
      _.extend(rendering, Backbone.Events);

      if (this.started) {
        self.started = false;
        this.application.initialize();
      } else {
        this.application = AppsRouter.initialize();
        self.started = true;
      }
  	}
  }

  // Backbone Multi-tenant router firing up.
  Application.initialize();
});
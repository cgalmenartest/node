define([
    'underscore',
    'backbone'
], function (_, Backbone) {

  var EventModel = Backbone.Model.extend({

    urlRoot: '/api/event'

  });

  return EventModel;
});
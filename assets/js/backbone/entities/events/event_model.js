define([
    'underscore',
    'backbone'
], function (_, Backbone) {
  'use strict';

  var EventModel = Backbone.Model.extend({

    urlRoot: '/event'

  });

    return EventModel;
});
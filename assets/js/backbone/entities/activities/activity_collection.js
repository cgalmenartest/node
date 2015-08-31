var _ = require('underscore');
var Backbone = require('backbone');
var ActivityModel = require('./activity_model');

var ActivityCollection = Backbone.Collection.extend({

  model: ActivityModel,
  url: '/api/admin/activities',

  initialize: function () {
    var self = this;
    this.fetch({
      success: function (data) {
        self.trigger("activity:collection:fetch:success", data);
      },
      error: function(data, xhr) {
        self.trigger("activity:collection:fetch:error", data, xhr);
      }
    });
  }

});

module.exports = ActivityCollection;

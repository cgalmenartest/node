var _ = require('underscore');
var Backbone = require('backbone');


var EventModel = Backbone.Model.extend({

  urlRoot: '/api/event'

});

module.exports = EventModel;

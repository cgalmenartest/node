var _ = require('underscore');
var Backbone = require('backbone');
var EventModel = require('./event_model');


var EventCollection = Backbone.Collection.extend({
  
  model: EventModel,
  
  parse: function (response) {
    if (response) {
      return response.events;
    }
  },

  url: '/api/event',

  initialize: function () {
    this.addAndSave();
  },

  addAndSave: function () {
    var self = this;

    this.listenTo(this, "event:save", function (data) {

      self.ev = new EventModel({
        title       : data['title'], 
        description : data['description'], 
        start       : data['start'],
        end         : data['end'],
        location    : data['location'],
        projectId   : data['projectId'] 
      });

      self.add(self.event);

      self.ev.save({}, {
        success: function (modelInstance, response) {
          self.trigger("event:save:success", modelInstance, response);
        }
      });
    });
  }

});

module.exports = EventCollection;

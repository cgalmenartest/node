define([
  'underscore',
  'backbone',
  'text!event_list_template'
], function (_, Backbone, EventListTemplate) {

  var EventCollectionView = Backbone.View.extend({

    el: "#event-list-wrapper",

    initialize: function () {
      this.render();
    },

    render: function () {
      
      var eventsJSON = {
        events: this.options.collection.toJSON()
      }

      this.compiledTemplate = _.template(EventListTemplate, eventsJSON);
      this.$el.html(this.compiledTemplate);

      return this;
    },

    cleanup: function () {
      $(this.el).children().remove()
    }

  });

  return EventCollectionView;
});
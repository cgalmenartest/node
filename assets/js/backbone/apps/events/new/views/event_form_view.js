define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'events_collection',
    'text!event_form_template'
], function ($, Bootstrap, _, Backbone, EventsCollection, EventFormTemplate) {

  var EventFormView = Backbone.View.extend({

    el: "#event-list-wrapper",
    
    template: _.template(EventFormTemplate),

    events: {
      "submit #event-form" : "post"
    },

    initialize: function () {
      this.options = _.extend(this.options, this.defaults);

      this.initializePosteventSaveEventListeners();
    },
    
    render: function () {
      this.$el.html(this.template)
    },

    post: function (e) {
      if (e.preventDefault()) e.preventDefault();

      var data = {
        title       : $("#event-title").val(),
        description : $("#event-description").val(),
        start       : new Date($("#event-start").val()).toISOString(),
        end         : new Date($("#event-end").val()).toISOString(),
        location    : $("#event-location").val(),
        projectId   : this.options.projectId
      };

      this.collection.trigger("event:save", data);
    },

    initializePosteventSaveEventListeners: function () {

      this.listenTo(this.collection, "events:render", function () {

        // Hard wipe out the modal upon the rendering of a event (success)
        $(".modal a[href='#addevent']").modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

      });

    }

  });

  return EventFormView;

});
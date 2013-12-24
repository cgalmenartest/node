define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'jquery_timepicker',
    'events_collection',
    'text!event_form_template'
], function ($, Bootstrap, _, Backbone, TimePicker, EventsCollection, EventFormTemplate) {

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

    initializeTimeZone: function () {
      var offset = (new Date()).getTimezoneOffset();
      var timezones = {
          '-12': 'Pacific/Kwajalein',
          '-11': 'Pacific/Samoa',
          '-10': 'Pacific/Honolulu',
          '-9': 'America/Juneau',
          '-8': 'America/Los Angeles',
          '-7': 'America/Denver',
          '-6': 'America/Mexico City',
          '-5': 'America/New York',
          '-4': 'America/Caracas',
          '-3.5': 'America/St Johns',
          '-3': 'America/Argentina/Buenos Aires',
          '-2': 'Atlantic/Azores',
          '-1': 'Atlantic/Azores',
          '0': 'Europe/London',
          '1': 'Europe/Paris',
          '2': 'Europe/Helsinki',
          '3': 'Europe/Moscow',
          '3.5': 'Asia/Tehran',
          '4': 'Asia/Baku',
          '4.5': 'Asia/Kabul',
          '5': 'Asia/Karachi',
          '5.5': 'Asia/Calcutta',
          '6': 'Asia/Colombo',
          '7': 'Asia/Bangkok',
          '8': 'Asia/Singapore',
          '9': 'Asia/Tokyo',
          '9.5': 'Australia/Darwin',
          '10': 'Pacific/Guam',
          '11': 'Asia/Magadan',
          '12': 'Asia/Kamchatka'
      };
      // create a timezone string for display
      var tz = timezones[-offset / 60];
      tz += ' (';
      if (offset <= 0) {
        tz += '+';
      }
      tz += (-offset/60) + ':00)';
      $('.timezone').html(tz);

      // set input pickers for time
      $('#event-start-time').timepicker({
        selectOnBlur: true,
        appendTo: '#div-event-start-time'
      });
      $('#event-end-time').timepicker({
        selectOnBlur: true,
        showDuration: true,
        durationTime: function() {
          return ($('#event-start-time').val());
        },
        appendTo: '#div-event-end-time'
      });
      // get the start time by rounding the current time to the nearest 30 minutes
      var coeff = 1000 * 60 * 30;
      var startTime = new Date();  //or use any other date
      startTime = new Date(Math.round(startTime.getTime() / coeff) * coeff)
      // the initial end time should be 1 hour after the initial start time
      var endTime = new Date(startTime.getTime() + 1000*60*60);
      $('#event-start-time').timepicker('setTime', startTime);
      $('#event-end-time').timepicker('setTime', endTime);
    },

    render: function () {
      this.$el.html(this.template);
      this.initializeTimeZone();
    },

    post: function (e) {
      if (e.preventDefault) e.preventDefault();

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
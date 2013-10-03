define([
  'jquery',
  'underscore',
  'backbone',
  'popovers',
  'events_collection',
  'event_collection_view',
  'modal_component',
  'event_form_view'
], function ($, _, Backbone, Popovers, EventsCollection, EventCollectionView, ModalComponent, EventFormView) {

  Application.Controller.EventList = Backbone.View.extend({

    el: "#event-list-wrapper",

    events: {
      'click .add-event'    : 'add',
      'click .rsvp'         : 'toggleRSVP',
      'click .featured-rsvp': 'toggleFeaturedRSVP',
      "mouseenter .project-people-div" : popoverPeopleOn,
      "mouseleave .project-people-div" : popoverPeopleOff
    },

    initialize: function (settings) {
      this.options = _.extend(settings, this.defaults)
      this.fireUpEventsCollection()
      this.requestEventsCollectionData()

      this.listenTo(this.collection, "event:save:success", function () {
        $(".modal").modal('hide')
        this.requestEventsCollectionData()
      });


    },

    fireUpEventsCollection: function () {
      if (this.collection) {
        this.collection.initialize()
      } else {
        this.collection = new EventsCollection()
      }
    },

    requestEventsCollectionData: function () {
      var self = this;
      this.collection.fetch({
        url: '/event/findAllByProjectId/' + parseInt(this.options.projectId),
        success: function (collection) {
          self.renderEventCollectionView(collection)
          collection = self.collection
        }
      })
    },

    renderEventCollectionView: function (collection) {
      
      if (this.eventCollectionView) {
        this.eventCollectionView.cleanup()
      }

      this.eventCollectionView = new EventCollectionView({
        el: "#event-list-wrapper",
        onRender: true,
        collection: collection
      })
    },

    add: function (e) {
      if (e.preventDefault()) e.preventDefault();

      if (this.modalComponent) this.modalComponent;
      this.modalComponent = new ModalComponent({
        el: "#container",
        id: "addEvent",
        modalTitle: 'Add Event'
      }).render();  

      if (!_.isUndefined(this.modalComponent)) {
        if (this.eventFormView) this.eventFormView;
        this.eventFormView = new EventFormView({
          el: ".modal-template",
          projectId: this.options.projectId,
          collection: this.collection
        }).render();  
      }
    },

    toggleRSVP: function (e) {
      if (e.preventDefault()) e.preventDefault()

      var id = parseInt($(e.currentTarget).parent().parent().parent().parent().parent().attr("id"))

      if ($(".rsvp").hasClass("data-event-flag-true") === false) {
        $(".rsvp").removeClass("data-event-flag-false");
        $(".rsvp").addClass("data-event-flag-true");
        $.ajax({
          url: '/event/attend/' + id,
          success: function (data) {
            $(e.currentTarget).text("I'm going.");
          }
        });
      } else {
        $(".rsvp").removeClass("data-event-flag-true");
        $(".rsvp").addClass("data-event-flag-false");
        $.ajax({
          url: '/event/cancel/' + id,
          success: function (data) {
            $(e.currentTarget).text("RSVP")
          }
        })
      }
    },

    toggleFeaturedRSVP: function (e) {
      if (e.preventDefault()) e.preventDefault()

      var id = parseInt($(e.currentTarget).parent().parent().parent().parent().attr("id"))

      if ($(".featured-rsvp").hasClass("data-event-flag-false")) {
        $(".featured-rsvp").removeClass("data-event-flag-false");
        $(".featured-rsvp").addClass("data-event-flag-true");

        $.ajax({
          url: '/event/attend/' + id,
          success: function (data) {
            $(e.currentTarget).text("I'm going.");
            $(e.currentTarget).attr("data-event-flag", true);
          }
        });
      } else {
        $(".featured-rsvp").removeClass("data-event-flag-true");
        $(".featured-rsvp").addClass("data-event-flag-false");
        $.ajax({
          url: '/event/cancel/' + id,
          success: function (data) {
            $(e.currentTarget).text("RSVP")
            $(e.currentTarget).attr("data-event-flag", false)
          }
        })
      }
    },


    cleanup: function () {
      $(this.el).children().remove()
    }

  });

  return Application.Controller.EventList
})
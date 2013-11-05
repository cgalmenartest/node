define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'popovers',
  'events_collection',
  'event_collection_view',
  'modal_component',
  'event_form_view'
], function ($, _, Backbone, utils, Popovers, EventsCollection, EventCollectionView, ModalComponent, EventFormView) {

  var popovers = new Popovers();

  Application.Controller.EventList = Backbone.View.extend({

    el: "#event-list-wrapper",

    events: {
      'click .add-event'                : 'add',
      'click .rsvp'                     : 'toggleRSVP',
      "mouseenter .project-people-div"  : popovers.popoverPeopleOn
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
        url: '/api/event/findAllByProjectId/' + parseInt(this.options.projectId),
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
      });

      popovers.popoverPeopleInit(".project-people-div");
    },

    add: function (e) {
      if (e.preventDefault) e.preventDefault();

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
      if (e.preventDefault) e.preventDefault()

      // Move this to a more semantic method
      var id = parseInt($(e.currentTarget).parent().parent().parent().parent().parent().attr("id"))

      if ($(".rsvp").hasClass("data-event-flag-true") === false) {
        $(".rsvp").removeClass("data-event-flag-false");
        $(".rsvp").addClass("data-event-flag-true");
        $.ajax({
          url: '/api/event/attend/' + id,
          success: function (data) {
            $(e.currentTarget).text("I'm going.");
          }
        });
      } else {
        $(".rsvp").removeClass("data-event-flag-true");
        $(".rsvp").addClass("data-event-flag-false");
        $.ajax({
          url: '/api/event/cancel/' + id,
          success: function (data) {
            $(e.currentTarget).text("RSVP")
          }
        })
      }
    },

    cleanup: function () {
      if (this.eventCollectionView) this.eventCollectionView.cleanup();
      removeView(this);
    }

  });

  return Application.Controller.EventList
})
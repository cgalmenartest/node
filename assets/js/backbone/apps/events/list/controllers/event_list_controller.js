define([
  'jquery',
  'underscore',
  'backbone',
  'events_collection',
  'event_collection_view',
  'modal_component',
  'event_form_view'
], function ($, _, Backbone, EventsCollection, EventCollectionView, ModalComponent, EventFormView) {

  Application.Controller.EventList = Backbone.View.extend({

    el: "#event-list-wrapper",

    events: {
      'click .add-event'    : 'add',
      'click .rsvp'         : 'rsvp',
      'click .remove-rsvp'  : 'removeRSVP'
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

    rsvp: function (e) {
      if (e.preventDefault()) e.preventDefault()

      var id = parseInt($(e.currentTarget).parent().parent().parent().parent().parent().attr("id"))

      $.ajax({
        url: '/event/attend/' + id,
        success: function (data) {
          $(e.currentTarget).attr('disabled', true)
          $("<button class='remove-rsvp'>x</button>").insertAfter(e.currentTarget)
        }
      })

    },

    removeRSVP: function (e) {
      if (e.preventDefault()) e.preventDefault()

      var id = parseInt($(e.currentTarget).parent().parent().parent().parent().parent().attr("id"))

      $.ajax({
        url: '/event/cancel/' + id,
        success: function (data) {
          $(e.currentTarget).remove()
          $("#" + id).find('.rsvp').attr("disabled", false)
        }
      })
    }

  });

  return Application.Controller.EventList
})
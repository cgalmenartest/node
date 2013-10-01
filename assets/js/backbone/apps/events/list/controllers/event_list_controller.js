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
      'click .rsvp'         : 'rsvp',
      'click .featured-rsvp': 'featuredRSVP',
      'click .remove-featured-rsvp': 'removeFeaturedRSVP',
      'click .remove-rsvp'  : 'removeRSVP',
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

    featuredRSVP: function (e) {
      if (e.preventDefault()) e.preventDefault()
      var id = parseInt($(e.currentTarget).parent().parent().parent().parent().attr('id'))
    var self = this;

      $.ajax({
        url: '/event/attend/' + id,
        success: function (data) {
          $(e.currentTarget).attr('disabled', true)
          $("<button class='remove-featured-rsvp'>x</button>").insertAfter(e.currentTarget)
          self.trigger("event:save:success")
        }
      })
    },

    removeFeaturedRSVP: function (e) {
      if (e.preventDefault()) e.preventDefault()

      var id = parseInt($(e.currentTarget).parent().parent().parent().parent().attr("id"))

      $.ajax({
        url: '/event/cancel/' + id,
        success: function (data) {
          $(e.currentTarget).remove()
          $("#" + id).find('.featured-rsvp').attr("disabled", false)
          var t = parseInt($("#" + id).find('.event-people').text()) - 1
          $("#"+id).find('.event-people').text(t+' people going')
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
    },

    cleanup: function () {
      $(this.el).children().remove()
    }

  });

  return Application.Controller.EventList
})
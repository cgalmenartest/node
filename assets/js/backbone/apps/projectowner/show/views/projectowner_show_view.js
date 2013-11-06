define([
  'jquery',
  'underscore',
  'async',
  'backbone',
  'utilities',
  //'popovers', /* Popovers,*/
  'modal_component',
  'autocomplete',
  'text!projectowner_show_template'
], function ($, _, async, Backbone, utils, ModalComponent, autocomplete, ProjectownerShowTemplate) {

  var ProjectownerShowView = Backbone.View.extend({

    el: "#projectowner-wrapper",

    // Set the model to null, before it is fetched from the server.
    // This allows us to clear out the previous data from the list_view,
    // and get ready for the new data for the project show view.
    // model: null,

    events: {
      "click button.owner-form-toggle"      : "toggleOwners",
      "click #owner-save"                   : "saveOwners"//,
      //"mouseenter .project-people-div"      : popovers.popoverPeopleOn,
    },

    // The initialize method is mainly used for event bindings (for effeciency)
    initialize: function () {
      var self = this;
      // self.initializeUI();
      self.initializeOwnerSelect2();
      // self.render();

    },

    render: function () {
      var compiledTemplate,
          data = { data: this.model.toJSON() };
        console.log('hi');
      compiledTemplate = _.template(ProjectownerShowTemplate, data);
      this.$el.html(compiledTemplate);
      //this.initializeOwnerSelect2();

      //this.model.trigger("project:show:rendered");

      return this;
    },




    // initializeUI: function() {
    //   popovers.popoverPeopleInit(".project-people-div");
    // },


    initializeOwnerSelect2: function () {
      var self = this;
        var formatResult = function (object, container, query) {
          return object.name;
        };
    $("#owners").select2({
        placeholder: 'Select Project Owners',
        multiple: true,
        formatResult: formatResult,
        formatSelection: formatResult,
        minimumInputLength: 1,
        ajax: {
            url: '/api/ac/user',
            dataType: 'json',
            data: function (term) {
              return {
                q: term
              };
            },
            results: function (data) {
              return { results: data };
          }
        }
      });
      $('#project-owners-form').hide();
      $('#project-owners-show').show();
      $('#owner-edit').show();
      $('#owner-save').hide();


    },

    toggleOwners : function(e){
      $('.owner-form-toggle').toggle(400);
    },



    saveOwners : function(e){
      if (e.preventDefault) e.preventDefault();
      var self = this;
      var oldOwners = this.model.attributes.owners || [];
      var s2data = $("#owners").select2("data")  || [];
      var oldOwnerIds = _.map(oldOwners, function(owner){ return owner.userId }) || [];
      var s2OwnerIds = _.map(s2data, function(owner){ return owner.id }) || [];

      var newOwnerIds = _.difference(s2OwnerIds, oldOwnerIds) || [];
      var removeOwnerIds = _.difference(oldOwnerIds, s2OwnerIds) || [];
      //makes it so you can't remove yourself as owner. Can debate this point later.
      removeOwnerIds = _.filter(removeOwnerIds, function(userId){ return !(cache.currentUser.id === userId); }, this)  || [];


      var removeOwners = _.filter(oldOwners, function(owner){ return _.indexOf( removeOwnerIds, owner.userId) >= 0 ? true : false; } , this)  || [];
      var removePOIds = _.map( removeOwners, function(owner){ return owner.id } )  || [];
      _.each(newOwnerIds, this.createOwner, self);
      _.each(removePOIds, this.removeOwner, self);

    },

    createOwner : function(ownerID){
      var self = this;
      //var ownerID = owner.id;
      //var owners = this.model.owners || [];
      $.ajax({
          url: '/api/projectowner/',
          type: 'POST',
          data: {
            projectId: self.model.attributes.id,
            userId: ownerID
          },
          success : function(data){

            //newOwners.push(data);
            // this.model.set('owners',owners)

          }

        }).done(function (result) {
        });
    },

    removeOwner: function (pOID) {
        var self = this;
        $.ajax({
        url: '/api/projectowner/' + pOID,
        type: 'DELETE',
        }).done(function (data) {
        });
      },



    // ---------------------
    //= Utility Methods
    // ---------------------
    cleanup: function() {
      removeView(this);
    }

  });

  return ProjectownerShowView;
});
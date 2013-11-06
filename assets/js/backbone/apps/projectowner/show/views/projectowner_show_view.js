define([
  'jquery',
  'underscore',
  'async',
  'backbone',
  'utilities',
  'popovers', /* Popovers,*/
  'modal_component',
  'autocomplete',
  'text!projectowner_show_template'
], function ($, _, async, Backbone, utils, Popovers, ModalComponent, autocomplete, ProjectownerShowTemplate) {

  //if(_.isUndefined(popovers)){var popovers = new Popovers();}

  var ProjectownerShowView = Backbone.View.extend({

    el: "#projectowner-wrapper",
    model : null,

    // Set the model to null, before it is fetched from the server.
    // This allows us to clear out the previous data from the list_view,
    // and get ready for the new data for the project show view.
    // model: null,

    events: {
      "click button.owner-form-toggle"      : "toggleOwners",
      "click #owner-save"                   : "saveOwners",
      "click .delete-projectowner"          : "removeOwner"

      //,
      //"mouseenter .project-people-div"      : popovers.popoverPeopleOn,
    },

    // The initialize method is mainly used for event bindings (for effeciency)
    initialize: function () {
      var self = this;
      // self.initializeUI();
      this.model.on("projectowner:show:rendered", function () {
        self.initializeOwnerSelect2();


      });

      this.model.on("project:update:owners:success", function (data) {

        // var popovers = new Popovers();
        // popovers.popoverPeopleInit(".project-people-div");
        // $('.project-people-div').on('mouseenter', function(){alert('hi')});
        // console.log(data);
        self.render( {model: data} );
      });



    },

    render: function () {

      var compiledTemplate,
          data = { data: this.model.toJSON() };
          // console.log(data);
      compiledTemplate = _.template(ProjectownerShowTemplate, data);
      // console.log(compiledTemplate);
      this.$el.html(compiledTemplate);
      //this.initializeOwnerSelect2();

      this.model.trigger("projectowner:show:rendered", data);

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
      self.$("#owners").select2({
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

      // self.$("#owners").select2('data', self.model.attributes.owners);

      self.$('#project-owners-form').hide();
      self.$('#project-owners-show').show();
      self.$('#owner-edit').show();
      self.$('#owner-save').hide();


    },

    toggleOwners : function(e){
      $('.owner-form-toggle').toggle(400);
    },



    saveOwners : function(e){
      if (e.preventDefault) e.preventDefault();
      var self = this;

      var pId = self.model.attributes.id;

      var oldOwners = this.model.attributes.owners || [];
      var s2data = $("#owners").select2("data")  || [];
      var oldOwnerIds = _.map(oldOwners, function(owner){ return owner.userId }) || [];
      var s2OwnerIds = _.map(s2data, function(owner){ return owner.id }) || [];

      var newOwnerIds = _.difference(s2OwnerIds, oldOwnerIds) || [];

      var removeOwnerIds = _.difference(oldOwnerIds, s2OwnerIds) || [];
      //makes it so you can't remove yourself as owner. Can debate this point later.
      removeOwnerIds = _.filter(removeOwnerIds, function(userId){ return !(cache.currentUser.id === userId); }, this)  || [];

      var removeOwners = _.filter(oldOwners, function(owner){ return _.indexOf( removeOwnerIds, owner.userId) >= 0 ? true : false; } , this)  || [];
      var unchangedOwners = _.filter(oldOwners, function(owner){ return _.indexOf( removeOwnerIds, owner.userId) >= 0 ? false : true; } , this)  || [];

      var removePOIds = _.map( removeOwners, function(owner){ return owner.id } )  || [];

      // var createdPOIds = [];

      async.each(newOwnerIds, createOwner, function(){

            async.each(removePOIds, removeOwner, function(){ self.model.trigger("projectowner:show:changed", unchangedOwners); });
      });

                                       // self.model.trigger("projectowner:show:changed", unchangedOwners); });



      // var createTemp = [self, createdPOIds];
      // _.each(newOwnerIds, self.createOwner, createTemp);
      // _.each(removePOIds, self.removeOwner, self);

      // console.log(createdPOIds);
      // this.model.set('owners', s2data);
      // console.log(s2data);

      // var modelData = _.map(s2data, function(owner){ return { id: , userId: owner.id }  });

      function createOwner(ownerID, done){
        var self = this;
        // var arr = this[1];
        // var POId;
        //var ownerID = owner.id;
        //var owners = this.model.owners || [];
        $.ajax({
            url: '/api/projectowner/',
            type: 'POST',
            data: {
              projectId: pId,
              userId: ownerID
            },
            success : function(data){
              var POId = data.id;
              unchangedOwners.push({ id:POId, userId: ownerID});

              // arr.push(data.id);
              //newOwners.push(data);
              // this.model.set('owners',owners)

            }

          }).done(function (result) {
            done();
            // if(!_.isUndefined(POId)){this[1].push(POId);}
          });
      };

      function removeOwner(pOId, done) {
        // if (e.preventDefault) e.preventDefault();
        // var pOId = $(e.currentTarget).data('poid');
        var self = this;
        $.ajax({
        url: '/api/projectowner/' + pOId,
        type: 'DELETE',
        }).done(function (data) {
          done();
        });
      };







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
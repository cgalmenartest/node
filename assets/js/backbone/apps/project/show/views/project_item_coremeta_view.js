define([
  'jquery',
  'underscore',
  'async',
  'backbone',
  'utilities',
  'popovers', /* Popovers,*/
  'modal_component',
  'autocomplete',
  'text!project_item_coremeta_template'
], function ($, _, async, Backbone, utils, Popovers, ModalComponent, autocomplete, ProjectItemCoreMetaTemplate) {

  //if(_.isUndefined(popovers)){var popovers = new Popovers();}

  var ProjectItemCoreMetaView = Backbone.View.extend({

    el: "#project-coremeta-wrapper",
    model : null,

    // Set the model to null, before it is fetched from the server.
    // This allows us to clear out the previous data from the list_view,
    // and get ready for the new data for the project show view.
    // model: null,

    events: {
      "click button.coremeta-form-toggle"        : "toggleCoreMeta",
      "click #coremeta-save"                     : "saveCoreMeta"
      // "click #coremeta-cancel"                   : "toggleCoreMeta"
      // "click .delete-projectowner"          : "removeOwner"
    },

    // The initialize method is mainly used for event bindings (for effeciency)
    initialize: function (options) {
      var self = this;
      this.options = options;
      this.data = options.data;
      this.action = options.action;
      if (this.options.action) {
        if (this.options.action == 'edit') {
          this.edit = true;
        }
      }

      this.model.on("project:coremeta:show:rendered", function () {
        self.initializeToggledElements();
      });

      // \\this.model.on(project:coremeta:show:rendered", function () {
      //   self.initializeOwnerSelect2();
      // });
      // //when owner set is updated, re-render and re-init popovers
      this.model.on("project:update:coremeta:success", function (data) {
        self.render();

      });

    },

    render: function () {
      var compiledTemplate,
      data = { data: this.model.toJSON() };
      compiledTemplate = _.template(ProjectItemCoreMetaTemplate, data);
      this.$el.html(compiledTemplate);

      this.model.trigger("project:coremeta:show:rendered", data);

      return this;
    },

    initializeToggledElements: function(){
      if (this.model.attributes.isOwner && this.edit){
        self.$('#coremeta-save').hide();
        self.$('#coremeta-cancel').hide();
        self.$('#project-coremeta-form').hide();
      }
      else{
        self.$('.coremeta-admin').hide();
      }
    },

    // initializeOwnerSelect2: function () {
    //   var self = this;
    //   if (this.model.attributes.isOwner){
    //     var formatResult = function (object, container, query) {
    //       return object.name;
    //     };
    //     var oldOwners = this.model.attributes.owners || [];
    //     var oldOwnerIds = _.map(oldOwners, function(owner){ return owner.userId }) || [];

    //     self.$("#owners").select2({
    //       placeholder: 'Add Project Owners',
    //       multiple: true,
    //       formatResult: formatResult,
    //       formatSelection: formatResult,
    //       minimumInputLength: 1,
    //       ajax: {
    //           url: '/api/ac/user',
    //           dataType: 'json',
    //           data: function (term) {
    //             return {
    //               q: term
    //             };
    //           },
    //           results: function (data) {
    //             return { results: _.filter(data, function(user){  return _.indexOf( oldOwnerIds, user.id) >= 0 ? false : true; }, self ) };
    //         }
    //       }
    //     });

    //     self.$('#owner-edit').show();

    //   }
    //   else
    //   {
    //     self.$('#owner-edit').hide();
    //   }

    //   self.$('#project-owners-form').hide();
    //   self.$('#project-owners-show').show();
    //   self.$('#owner-save').hide();
    //   self.$('#owner-cancel').hide();

    // },

    toggleCoreMeta : function(e){
      if (!this.model.attributes.isOwner && this.edit) return false;
      $('.coremeta-form-toggle').toggle(400);
    },

    saveCoreMeta : function(e){
      if (e.preventDefault) e.preventDefault();
      if (!this.model.attributes.isOwner && this.edit) return false;
      var self = this;
      // if (this.modalComponent) this.modalComponent;
      // this.modalComponent = new ModalComponent({
      //   el: "#container",
      //   id: "editProject",
      //   modalTitle: "Edit Project"
      // }).render();

      // if (!_.isUndefined(this.modalComponent)) {
      //   if (this.projectEditFormView) this.projectEditForm();
      //   this.projectEditFormView = new ProjectEditFormView({
      //     el: ".modal-template",
      //     model: self.model
      //   }).render();
      // }


    },




    // saveOwners : function(e){
    //   if (e.preventDefault) e.preventDefault();
    //   if (!this.model.attributes.isOwner) return false;
    //   var self = this;

    //   var pId = self.model.attributes.id;

    //   var oldOwners = this.model.attributes.owners || [];
    //   var s2data = $("#owners").select2("data")  || [];
    //   var s2OwnerIds = _.map(s2data, function(owner){ return owner.id }) || [];

    //   async.each(s2OwnerIds, createOwner, function(){ self.model.trigger("projectowner:show:changed", oldOwners); });

    //   $("#owners").select2("data", []);

    //   function createOwner(ownerID, done){
    //     var self = this;
    //     $.ajax({
    //         url: '/api/projectowner/',
    //         type: 'POST',
    //         data: {
    //           projectId: pId,
    //           userId: ownerID
    //         },
    //         success : function(data){
    //           var POId = data.id;
    //           oldOwners.push({ id:POId, userId: ownerID});
    //         }

    //       }).done(function (data) {
    //         done();
    //       });
    //   };

    // },

    // removeOwner: function(e) {
    //   if (e.preventDefault) e.preventDefault();
    //   $(e.currentTarget).off("mouseenter");
    //   $('.popover').remove();

    //   var pOId = $(e.currentTarget).data('poid');
    //   var uId = $(e.currentTarget).data('uid');
    //   var self = this;

    //   if(typeof cache !== "undefined" && uId !== cache.currentUser.id)
    //   {
    //     $.ajax({
    //       url: '/api/projectowner/' + pOId,
    //       type: 'DELETE',
    //     }).done(function (data) {
    //         // done();
    //     });
    //   }

    //   var oldOwners = this.model.attributes.owners || [];
    //   var unchangedOwners = _.filter(oldOwners, function(owner){ return ( owner.id !== pOId ); } , this)  || [];
    //   self.model.trigger("projectowner:show:changed", unchangedOwners);
    // },




    // ---------------------
    //= Utility Methods
    // ---------------------
    cleanup: function() {
      removeView(this);
    }

  });

  return ProjectItemCoreMetaView;
});
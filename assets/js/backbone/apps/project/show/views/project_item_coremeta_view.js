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
      this.edit = false;
      if (this.options.action) {
        if (this.options.action == 'edit') {
          this.edit = true;
        }
      }

      this.model.on("project:coremeta:show:rendered", function () {
        self.initializeToggledElements();
      });


      this.model.on("project:save:success", function (data) {
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
      var self = this;
      if (this.model.attributes.isOwner && this.edit){
        self.$('#coremeta-save').hide();
        self.$('#coremeta-cancel').hide();
        self.$('#project-coremeta-form').hide();
      }
      else{
        self.$('.coremeta-admin').hide();
      }
    },



    toggleCoreMeta : function(e){
      if (!this.model.attributes.isOwner && this.edit) return false;
      $('.coremeta-form-toggle').toggle(400);
    },

    saveCoreMeta : function(e){
      if (e.preventDefault) e.preventDefault();
      if (!this.model.attributes.isOwner && this.edit) return false;
      var self = this;

      var pId = self.model.attributes.id;
      var title = self.$('#project-edit-form-title').val();
      var description = self.$('#project-edit-form-description').val();
      var params = { title :title, description: description };

        self.model.trigger("project:model:update", params);

    },






    // ---------------------
    //= Utility Methods
    // ---------------------
    cleanup: function() {
      removeView(this);
    }

  });

  return ProjectItemCoreMetaView;
});
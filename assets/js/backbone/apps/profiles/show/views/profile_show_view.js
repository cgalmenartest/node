define([
  'jquery',
  'dropzone',
  'underscore',
  'backbone',
  'text!profile_show_template'
], function ($, dropzone, _, Backbone, ProfileTemplate) {

  var ProfileShowView = Backbone.View.extend({

    events: {
      "submit #profile-form"       : "save",
      "keyup #name, #username"     : "fieldModified",
      "click .addEmail"            : "addEmail",
      "click .removeAuth"          : "removeAuth"
    },

    render: function () {
      var template = _.template(ProfileTemplate, this.model.toJSON());
      this.$el.html(template);
      
      this.initializeFileUpload();
      this.initializeForm();
      this.updatePhoto();

      return this;
    },

    initializeFileUpload: function () {
      var _this = this;

      var myDropzone = new dropzone("#fileupload", {
        url: "/file/create",
      });

      myDropzone.on("addedfile", function(file) {
        // no need for the dropzone preview
        $('.dz-preview').hide();
      });

      myDropzone.on("sending", function(file) {
        $('#file-upload-progress-container').show();
      });

      // Show the progress bar
      myDropzone.on("uploadprogress", function(file, progress, bytesSent) {
        console.log(progress);
        $('#file-upload-progress').css(
          'width',
          progress + '%'
        );
      });

      myDropzone.on("success", function(file, data) {
        _this.model.trigger("profile:updateWithPhotoId", data);
      });

      myDropzone.on("thumbnail", function(file) { });
    },

    updatePhoto: function () {
      this.model.on("profile:updatedPhoto", function (data) {
        var url = '/user/photo/' + data.get("id");
        $("#profile-photo").attr("src",url);
        $('#file-upload-progress-container').hide();
      });
    },

    initializeForm: function() {
      var _this = this;
      $("#submit").html("Save Changes");
      
      this.model.on("profile:saveDone", function (data) {
        $("#submit").html("Saved!");
        $("#submit").removeClass("btn-primary");
        $("#submit").addClass("btn-success");
        var headerText = data.get("name");
        if (!headerText) { headerText = data.get("username"); }
        $("#profile-header").html(headerText);
      });
      this.model.on("profile:removeAuthDone", function (data, id) {
        _this.render();
      });
    },

    fieldModified: function(e) {
      $("#submit").html("Save Changes");
      $("#submit").removeAttr("disabled");
      $("#submit").removeClass("btn-success");
      $("#submit").addClass("btn-primary");
    },

    save: function (e) {
      if (e.preventDefault()) e.preventDefault();
      $("#submit").attr("disabled", "disabled");
      $("#submit").html('<i class="icon-spinner icon-spin"></i> Saving...');

      var data = {
        name: $("#name").val(),
        username: $("#username").val()
      };

      this.model.trigger("profile:save", data);
    },

    removeAuth: function (e) {
      if (e.preventDefault()) e.preventDefault();
      var node = $(e.target);
      // walk up the tree until we get to the marked node
      while (!(node.hasClass("removeAuth"))) {
        node = node.parent();
      }
      this.model.trigger("profile:removeAuth", node.attr("id"));
    },

    addEmail: function (e) {
      if (e.preventDefault()) e.preventDefault();
      // Not yet implemented
      console.log("Not implemented.");
    },

  });

  return ProfileShowView;
});

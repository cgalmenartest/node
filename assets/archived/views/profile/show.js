define([
  'jquery',
  'dropzone',
  'underscore',
  'backbone',
  'text!../../../../../templates/profile/show.html'
], function ($, dropzone, _, Backbone, ProfileTemplate) {

  var ProfileShowView = Backbone.View.extend({

    el: "#container",

    events: {
     "submit #profile-form": "post"
    },

    initialize: function () {
      this.render();
      this.initializeFileUpload();
      this.updatePhoto
    },

    render: function () {
      var data      = this.model.toJSON()
          template  = _.template(ProfileTemplate, data);

      this.$el.html(template)
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
        var url;
        if (data.get("photoId")) {
          url = '/file/get/' + data.get("photoId");
        } else {
          url = data.get("photoUrl");
        }
        $("#profile-photo").attr("src",url);
        $('#file-upload-progress-container').hide();
      });
    }
  });

  return ProfileShowView;
});

define([
  'jquery',
  'dropzone',
  'underscore',
  'backbone',
  'text!project_show_template'
], function ($, dropzone, _, Backbone, ProjectShowTemplate) {
  'use strict';

  var ProjectShowView = Backbone.View.extend({

    el: $("#container"),

    render: function () {
      var data, compiledTemplate;

      compiledTemplate = _.template(ProjectShowTemplate, this.model.toJSON());
      this.$el.html(compiledTemplate);

      // if (!this.tasks) {
      //   this.tasks = new TaskCollection({ id: id });
      //   this.tasks.fetch();
      // } else { 
      //   this.tasks.fetch();
      // }

      // if (!this.comments) {
      //   this.comments = new CommentsCollection({ id: id })
      // }
      // this.comments.fetch();

      // compiledTemplate = _.template(projectShowTemplate, data);
      // this.$el.html(compiledTemplate).hide().fadeIn();

      // new CommentFormView().render();
      return this;
    },

    cleanup: function () {
      $(this).remove();
      $(this.el).undelegateEvents();
    }

    // updatePhoto: function () {
    //   this.model.on("project:updatedPhoto", function (data) {
    //     var url;
    //     if (data.get("coverId")) {
    //       url = '/file/get/' + data.get("coverId");
    //       $("#project-header").css('background-image', "url(" + url + ")");
    //     }
    //     $('#file-upload-progress-container').hide();
    //   });
    // },

    // initializeFileUpload: function () {
    //   var _this = this;

    //   var myDropzone = new dropzone("#fileupload", {
    //     url: "/file/create",
    //   });

    //   myDropzone.on("addedfile", function(file) {
    //     // no need for the dropzone preview
    //     $('.dz-preview').hide();
    //   });

    //   myDropzone.on("sending", function(file) {
    //     $('#file-upload-progress-container').show();
    //   });

    //   // Show the progress bar
    //   myDropzone.on("uploadprogress", function(file, progress, bytesSent) {
    //     $('#file-upload-progress').css(
    //       'width',
    //       progress + '%'
    //     );
    //   });

    //   myDropzone.on("success", function(file, data) {
    //     _this.model.trigger("project:updateWithPhotoId", data);
    //   });

    //   myDropzone.on("thumbnail", function(file) { });
    // }

      
  });

  return ProjectShowView;
});
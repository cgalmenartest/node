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

      this.initializeFileUpload();
      this.updatePhoto();

      return this;
    },

    updatePhoto: function () {
      this.listenTo(this.model, "project:updated:photo:success", function (data) {
        var model = data.toJSON(), url;

        if (model.coverId) {
          url = '/file/get/' + model.coverId;
          $("#project-header").css('background-image', "url(" + url + ")");
        }
        $('#file-upload-progress-container').hide();
      });
    },

    initializeFileUpload: function () {
      var self = this;

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
        $('#file-upload-progress').css(
          'width',
          progress + '%'
        );
      });

      myDropzone.on("success", function(file, data) {
        self.model.trigger("project:update:photoId", data);
      });

      myDropzone.on("thumbnail", function(file) { });
    },

      
    cleanup: function () {
      $(this).remove();
    },
  });

  return ProjectShowView;
});
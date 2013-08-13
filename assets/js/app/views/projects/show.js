define([
  'jquery',
  'dropzone',
  'underscore',
  'backbone',
  '../../collections/tasks',       
  'text!../../../../templates/projects/show.html',
  '../../views/comments/form',
  '../../collections/comments'
], function ($, dropzone, _, Backbone, TaskCollection, projectShowTemplate, CommentFormView, CommentsCollection) {
  'use strict';

  var ProjectShowView = Backbone.View.extend({

    el: $("#container"),

    initialize: function (data) {
      this.isRendered = false;
      this.render(data);

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
        $('#file-upload-progress').css(
          'width',
          progress + '%'
        );
      });
      myDropzone.on("success", function(file, data) {
        _this.model.trigger("project:updateWithPhotoId", data);
      });
      myDropzone.on("thumbnail", function(file) { });

      this.model.on("project:updatedPhoto", function (data) {
        var url;
        if (data.get("coverId")) {
          url = '/file/get/' + data.get("coverId");
          $("#project-header").css('background-image', "url(" + url + ")");
        }
        $('#file-upload-progress-container').hide();
      });
    },

    render: function (data) {
      var _this = this;

      if (this.isRendered) return;
      this.isRendered = true;
      
      var compiledTemplate, 
      id = parseInt($(".project-id").text());

      if (!this.tasks) {
        this.tasks = new TaskCollection({ id: id });
        this.tasks.fetch();
      } else { 
        this.tasks.fetch();
      }

      // this.comments.fetch();

      if (!this.comments) {
        this.comments = new CommentsCollection({ id: id })
      }
      this.comments.fetch();

      compiledTemplate = _.template(projectShowTemplate, data);
      this.$el.html(compiledTemplate).hide().fadeIn();

      new CommentFormView().render();
    }

      
  });

  return ProjectShowView;
});
define([
  'jquery',
  'dropzone',
  'jquery_select2',
  'underscore',
  'backbone',
  'utilities',
  'text!project_show_template',
  'tag_show_view',
  'project_edit_form_view'
], function ($, dropzone, select2, _, Backbone, utils, ProjectShowTemplate, TagShowView, ProjectEditFormView) {

  var ProjectShowView = Backbone.View.extend({

    el: $("#container"),

    events: {
      'click #editProject': 'editProject'
    },

    editProject: function () {
      new ProjectEditFormView({
        el: ".main-section",
        model: this.model
      }).render();
    },

    render: function () {
      var compiledTemplate,
          data = { data: this.model.toJSON() };

      compiledTemplate = _.template(ProjectShowTemplate, data);
      this.$el.html(compiledTemplate);

      this.initializeFileUpload();
      this.initializeTags();
      this.updatePhoto();

      this.model.trigger("project:show:rendered");

      return this;
    },

    updatePhoto: function () {
      this.listenTo(this.model, "project:updated:photo:success", function (data) {
        var model = data.toJSON(), url;
        if (model.coverId) {
          url = '/api/file/get/' + model.coverId;
          $("#project-header").css('background-image', "url(" + url + ")");
        }
        $('#file-upload-progress-container').hide();
      });
    },

    initializeTags: function() {
      this.tagView = new TagShowView({
        model: this.model,
        el: '.tag-wrapper',
        target: 'project',
        url: '/api/tag/findAllByProjectId/'
      });
      this.tagView.render();
    },

    initializeFileUpload: function () {
      var self = this;

      var myDropzone = new dropzone("#fileupload", {
        url: "/api/file/create",
        clickable: ['#fileupload', '#fileupload-icon']
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
      removeView(this);
    },
  });

  return ProjectShowView;
});
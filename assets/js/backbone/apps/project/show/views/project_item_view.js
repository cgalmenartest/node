define([
  'jquery',
  'dropzone',
  'jquery_select2',
  'underscore',
  'backbone',
  'utilities',
  'text!project_show_template',
  'tag_show_view'
], function ($, dropzone, select2, _, Backbone, utils, ProjectShowTemplate, TagShowView) {

  var ProjectShowView = Backbone.View.extend({

    el: "#container",

    events: {

    },

    initialize: function (options) {
      this.options = options;
      this.data = options.data;
      this.action = options.action;
      this.edit = false;
      if (this.options.action) {
        if (this.options.action == 'edit') {
          this.edit = true;
        }
      }
      // if (this.data.saved) {
      //   this.saved = true;
      //   this.data.saved = false;
      // }
    },

    render: function () {
      var compiledTemplate;
      var data = {
        data: this.model.toJSON(),
        user: window.cache.currentUser
      };

      compiledTemplate = _.template(ProjectShowTemplate, data);
      this.$el.html(compiledTemplate);

      this.initializeToggle();
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

    initializeToggle: function () {
      if(this.edit){
        this.$('#editProject').find('.box-icon-text').html('View Project');
      }
      else{
        this.$('#editProject').find('.box-icon-text').html('Edit Project');
      }
    },

    initializeTags: function() {
      this.tagView = new TagShowView({
        model: this.model,
        el: '.tag-wrapper',
        target: 'project',
        targetId: 'projectId',
        edit: this.edit,
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
      if (this.tagView) { this.tagView.cleanup(); }
      removeView(this);
    },
  });

  return ProjectShowView;
});
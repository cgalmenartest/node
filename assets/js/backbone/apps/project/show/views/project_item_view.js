define([
  'jquery',
  'jquery_iframe',
  'jquery_fileupload',
  'jquery_select2',
  'underscore',
  'backbone',
  'utilities',
  'text!project_show_template',
  'tag_show_view'
], function ($, jqIframe, jqFU, select2, _, Backbone, utils, ProjectShowTemplate, TagShowView) {

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
    },

    render: function () {
      var compiledTemplate;
      var data = {
        hostname: window.location.hostname,
        data: this.model.toJSON(),
        user: window.cache.currentUser || {},
        edit: this.edit
      };

      compiledTemplate = _.template(ProjectShowTemplate, data);
      this.$el.html(compiledTemplate);

      this.initializeToggle();
      this.initializeFileUpload();
      this.initializeTags();
      this.updatePhoto();
      this.updateProjectEmail();
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

    updateProjectEmail: function() {
      var self = this;
      $.ajax({
        url: '/api/email/makeURL?email=contactUserAboutProject&subject=Check Out "'+ self.model.attributes.title + '"' +
        '&projectTitle=' + self.model.attributes.title +
        '&projectLink=' + window.location.protocol + "//" + window.location.host + "" + window.location.pathname +
        '&projectDescription=' + (self.model.attributes.description || ''),
        type: 'GET'
      }).done( function (data) {
        self.$('#email').attr('href', data);
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

    initializeTags: function () {
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

      $('#fileupload').fileupload({
          url: "/api/file/create",
          dataType: 'text',
          acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
          add: function (e, data) {
            $('#file-upload-progress-container').show();
            data.submit();
          },
          progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#file-upload-progress').css(
              'width',
              progress + '%'
            );
          },
          done: function (e, data) {
            // for IE8/9 that use iframe
            if (data.dataType == 'iframe text') {
              var result = JSON.parse(data.result);
            }
            // for modern XHR browsers
            else {
              var result = JSON.parse($(data.result).text());
            }
            self.model.trigger("project:update:photoId", result[0]);
          }
      });

    },

    cleanup: function () {
      if (this.tagView) { this.tagView.cleanup(); }
      removeView(this);
    },
  });

  return ProjectShowView;
});
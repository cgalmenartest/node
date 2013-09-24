define([
  'jquery',
  'dropzone',
  'jquery_select2',
  'underscore',
  'backbone',
  'tag_config',
  'text!project_show_template',
  'text!project_tag_template'
], function ($, dropzone, select2, _, Backbone, TagConfig, ProjectShowTemplate, ProjectTagTemplate) {
  'use strict';

  var ProjectShowView = Backbone.View.extend({

    el: $("#container"),

    render: function () {
      console.log(TagConfig);
      console.log(TagConfig.tags);
      var compiledTemplate,
          data = { data: this.model.toJSON(), tags: TagConfig.tags };

      compiledTemplate = _.template(ProjectShowTemplate, data);
      this.$el.html(compiledTemplate);

      rendering.trigger("project:show:rendered");

      this.initializeFileUpload();
      this.initializeTags();
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

    initializeTags: function() {
      // Load tags for the view
      var self = this;

      var renderTag = function(tag) {
        var templData = { data: self.model.toJSON(), tags: TagConfig.tags, tag: tag };
        var compiledTemplate = _.template(ProjectTagTemplate, templData);
        var tagDom = $("." + tag.tag.type).children(".tags");
        tagDom.append(compiledTemplate);
      };

      $.ajax({
        url: '/tag/findAllByProjectId/' + this.model.id
      }).done(function (data) {
        for (var i = 0; i < data.length; i++) {
          // Render tags onto page
          renderTag(data[i]);
        }
      });

      // Initialize Select2 for Administrative Functions
      var formatSelection = function (object, container) {
        return object.name;
      };
      var formatResult = function (object, container, query) {
        return object.name;
      };

      $("#input-tags").select2({
        placeholder: 'Add tags',
        multiple: true,
        formatResult: formatResult,
        formatSelection: formatSelection,
        ajax: {
          url: '/ac/tag',
          dataType: 'json',
          data: function (term) {
            return { q: term };
          },
          results: function (data) {
            return { results: data };
          }
        }
      });

      // New tags added in to the DB via the modal
      this.listenTo(this.model, "project:tag:new", function (data) {
        // Destory modal
        $(".modal-backdrop").hide();
        $(".modal").modal('hide');
        // Add tag into the data list
        var s2data = $("#input-tags").select2("data");
        s2data.push(data);
        $("#input-tags").select2("data", s2data);
      });

      // Tags saved using the select2 dialog
      this.listenTo(this.model, "project:tag:save", function (data) {
        for (var i = 0; i < data.length; i++) {
          renderTag(data[i]);
        }
        $("#input-tags").select2("val", "");
      });

      this.listenTo(this.model, "project:tag:delete", function (e) {
        $(e.currentTarget).parent('li').remove();
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
      $(this.el).children().remove();
      this.undelegateEvents()
    },
  });

  return ProjectShowView;
});
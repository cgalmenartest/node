define([
  'jquery',
  'bootstrap',
  'underscore',
  'dropzone',
  'backbone',
  'utilities',
  'async',
  'text!attachment_item_template',
  'text!attachment_show_template'
], function ($, Bootstrap, _, Dropzone, Backbone, utils, async,
  AITemplate, ASTemplate) {

  var AttachmentShowView = Backbone.View.extend({

    events: {
      'click .file-delete'      : 'delete'
    },

    initialize: function (options) {
      this.options = options;
    },

    initializeFiles: function () {
      var self = this;
      $.ajax({
        url: '/api/attachment/findAllBy' + this.options.target + 'Id/' + this.options.id
      }).done(function (data) {
        if (data && (data.length > 0)) {
          $(".attachment-none").hide();
        }
        _.each(data, function (f) {
          var template = self.renderAttachment(f);
          $(".attachment-tbody").append(template);
        });
      });
    },

    initializeFileUpload: function () {
      var self = this;

      var myDropzone = new Dropzone(".attachment-filebtn", {
        url: "/api/file/create",
        // clickable: ['#fileupload', '#fileupload-icon']
      });

      myDropzone.on("addedfile", function(file) {
        // no need for the dropzone preview
        $('.dz-preview').hide();
      });

      myDropzone.on("sending", function(file, xhr, formData) {
        formData.append('type', 'image_square');
        $('.attachment-fileupload > .progress').show();
      });

      // Show the progress bar
      myDropzone.on("uploadprogress", function(file, progress, bytesSent) {
        $('.attachment-fileupload > .progress-bar').css(
          'width',
          progress + '%'
        );
      });

      myDropzone.on("success", function(file, data) {
        // store id in the database with the file
        var aData = {
          fileId: data.id
        };
        aData[self.options.target + 'Id'] = self.options.id;
        $.ajax({
          url: '/api/attachment',
          type: 'POST',
          data: JSON.stringify(aData),
          dataType: 'json',
          contentType: 'application/json'
        }).done(function (attachment) {
          $('.attachment-fileupload > .progress').hide();
          self.renderNewAttachment(data, attachment);
        });
      });

      myDropzone.on("thumbnail", function(file) { });
    },

    render: function () {
      data = {
        user: window.cache.currentUser
      }
      var template = _.template(ASTemplate, data);
      this.$el.html(template);
      this.initializeFileUpload();
      this.initializeFiles();
      return this;
    },

    renderAttachment: function (attachment) {
      var data = {
        a: attachment,
        user: window.cache.currentUser,
        owner: this.options.owner
      };
      var templ = _.template(AITemplate, data);
      return templ;
    },

    renderNewAttachment: function (file, attachment) {
      attachment.file = file;
      var templ = this.renderAttachment(attachment);
      // should put this at the top of the list rather than the bottom
      $(".attachment-none").hide();
      $(".attachment-tbody").append(templ);
    },

    delete: function (e) {
      if (e.preventDefault) { e.preventDefault(); }
      $.ajax({
        url: '/api/attachment/' + $(e.currentTarget).data('id'),
        type: 'DELETE',
        success: function (d) {
          // remove from the DOM
          var len = $($(e.currentTarget).parents('tbody')[0]).children().length;
          $(e.currentTarget).parents('tr')[0].remove();
          if (len == 2) {
            $(".attachment-none").show();
          }
        }
      });
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return AttachmentShowView;

});

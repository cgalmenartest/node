define([
  'jquery',
  'bootstrap',
  'underscore',
  'dropzone',
  'jquery_timeago',
  'backbone',
  'utilities',
  'async',
  'popovers',
  'text!attachment_item_template',
  'text!attachment_show_template'
], function ($, Bootstrap, _, Dropzone, TimeAgo, Backbone, utils, async,
  Popovers, AITemplate, ASTemplate) {

  var popovers = new Popovers();

  var AttachmentShowView = Backbone.View.extend({

    events: {
      'click .file-delete'                : 'delete',
      "mouseenter .project-people-div"    : popovers.popoverPeopleOn,
      "click .project-people-div"         : popovers.popoverClick,
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
        $("time.timeago").timeago();
        popovers.popoverPeopleInit(".project-people-div");
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
      $(".attachment-none").hide();
      // put new at the top of the list rather than the bottom
      $(".attachment-tbody").prepend(templ);
      $("time.timeago").timeago();
      popovers.popoverPeopleInit(".project-people-div");
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

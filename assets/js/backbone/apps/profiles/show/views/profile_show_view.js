define([
  'jquery',
  'async',
  'dropzone',
  'underscore',
  'backbone',
  'tag_show_view',
  'text!profile_show_template'
], function ($, async, dropzone, _, Backbone, TagShowView, ProfileTemplate) {

  var ProfileShowView = Backbone.View.extend({

    events: {
      "submit #profile-form"       : "profileSubmit",
      "click #profile-save"        : "profileSave",
      "click #profile-edit"        : "profileEdit",
      "click #profile-cancel"      : "profileCancel",
      "keyup #name, #username, #title, #bio" : "fieldModified",
      "keyup #username"            : "checkUsername",
      "click #username-button"     : "clickUsername",
      "click .addEmail"            : "addEmail",
      "click .removeAuth"          : "removeAuth"
    },

    initialize: function (options) {
      this.options = options;
      this.data = options.data;
      this.edit = false;
      if (this.options.routeId) {
        if (this.options.routeId == 'edit') {
          this.edit = true;
        }
      }
      if (this.data.saved) {
        this.saved = true;
        this.data.saved = false;
      }
    },

    render: function () {
      var data = {
        data: this.model.toJSON(),
        edit: this.edit,
        saved: this.saved
      }
      data.data.agency = this.model.agency;
      data.data.location = this.data.location;
      var template = _.template(ProfileTemplate, data);
      this.$el.html(template);
      
      this.initializeFileUpload();
      this.initializeForm();
      this.initializeSelect2();
      this.initializeTags();
      this.updatePhoto();

      return this;
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

      myDropzone.on("sending", function(file, xhr, formData) {
        formData.append('type', 'image_square');
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
        self.model.trigger("profile:updateWithPhotoId", data);
      });

      myDropzone.on("thumbnail", function(file) { });
    },

    initializeTags: function() {
      this.tagView = new TagShowView({
        model: this.model,
        el: '.tag-wrapper',
        target: 'profile',
        edit: this.edit,
        url: '/api/tag/findAllByUserId/'
      });
      this.tagView.render();
    },

    updatePhoto: function () {
      this.model.on("profile:updatedPhoto", function (data) {
        var url = '/api/user/photo/' + data.get("id");
        $("#project-header").css('background-image', "url(" + url + ")");
        $('#file-upload-progress-container').hide();
      });
    },

    initializeForm: function() {
      var self = this;
      
      this.listenTo(self.model, "profile:save:success", function (data) {
        $("#submit").button('success');
        // Bootstrap .button() has execution order issue since it
        // uses setTimeout to change the text of buttons.
        // make sure attr() runs last

        var tags = [
          $("#company").select2('data'),
          $("#location").select2('data')
        ];
        self.model.trigger("profile:tags:save", tags);
      });
      this.listenTo(self.model, "profile:tags:save", function (tags) {
        var removeTag = function(type, done) {
          if (self.model[type]) {
            // if it is already stored, abort.
            if (self.model[type].tagId) {
              return done();
            }
            $.ajax({
              url: '/api/tag/' + self.model[type].tagId,
              type: 'DELETE',
            }).done(function (data) {
              return done();
            });
            return;
          }
          return done();
        }

        var addTag = function (tag, done) {
          // the tag is invalid or hasn't been selected
          if (!tag || !tag.id) {
            return done();
          }
          // the tag already is stored in the db
          if (tag.tagId) {
            return done();
          }
          var tagMap = {
            tagId: tag.id
          };
          $.ajax({
            url: '/api/tag',
            type: 'POST',
            data: tagMap
          }).done(function (data) {
            done();
          });
        }

        async.each(['agency','location'], removeTag, function (err) {
          async.each(tags, addTag, function (err) {
            return self.model.trigger("profile:tags:save:success", err);
          });
        });
      });
      this.listenTo(self.model, "profile:tags:save:success", function (data) {
        setTimeout(function() { $("#profile-save, #submit").attr("disabled", "disabled") }, 0);
        $("#profile-save, #submit").removeClass("btn-primary");
        $("#profile-save, #submit").addClass("btn-success");
        self.data.saved = true;
        Backbone.history.navigate('profile', { trigger: true });
      });
      this.listenTo(self.model, "profile:save:fail", function (data) {
        $("#submit").button('fail');
      });
      this.listenTo(self.model, "profile:removeAuth:success", function (data, id) {
        self.render();
      });
      this.listenTo(self.model, "profile:input:changed", function (e) {
        $("#profile-save, #submit").button('reset');
        $("#profile-save, #submit").removeAttr("disabled");
        $("#profile-save, #submit").removeClass("btn-success");
        $("#profile-save, #submit").addClass("btn-primary");
      });
    },

    initializeSelect2: function () {
      var self = this;
      var formatResult = function (object, container, query) {
        return object.name;
      };

      var company = this.model.agency;
      var location = this.model.location;
      $("#company").select2({
        placeholder: 'Select an Agency',
        formatResult: formatResult,
        formatSelection: formatResult,
        minimumInputLength: 2,
        ajax: {
          url: '/api/ac/tag',
          dataType: 'json',
          data: function (term) {
            return {
              type: 'agency',
              q: term
            };
          },
          results: function (data) {
            return { results: data };
          }
        }
      });
      if (company) {
        $("#company").select2('data', company);
      }
      $("#company").on('change', function (e) {
        self.model.trigger("profile:input:changed", e);
      });
      $("#location").select2({
        placeholder: 'Select a Location',
        formatResult: formatResult,
        formatSelection: formatResult,
        minimumInputLength: 1,
        data: [ location ],
        ajax: {
          url: '/api/ac/tag',
          dataType: 'json',
          data: function (term) {
            return {
              type: 'location',
              q: term
            };
          },
          results: function (data) {
            return { results: data };
          }
        }
      });
      if (location) {
        $("#location").select2('data', location);
      }
      $("#location").on('change', function (e) {
        self.model.trigger("profile:input:changed", e);
      });
    },

    fieldModified: function (e) {
      this.model.trigger("profile:input:changed", e);
    },

    profileCancel: function (e) {
      e.preventDefault();
      Backbone.history.navigate('profile', { trigger: true });
    },

    profileEdit: function (e) {
      e.preventDefault();
      Backbone.history.navigate('profile/edit', { trigger: true });
    },

    profileSave: function (e) {
      e.preventDefault();
      $("#profile-form").submit();
    },

    profileSubmit: function (e) {
      e.preventDefault();
      if (!$("#username-button").hasClass('btn-success')) {
        alert("Please pick a valid username.");
        return;
      }
      $("#profile-save, #submit").button('loading');
      setTimeout(function() { $("#profile-save, #submit").attr("disabled", "disabled") }, 0);
      var data = {
        name: $("#name").val(),
        username: $("#username").val(),
        title: $("#title").val(),
        bio: $("#bio").val()
      };
      this.model.trigger("profile:save", data);
    },

    removeAuth: function (e) {
      e.preventDefault();
      var node = $(e.target);
      // walk up the tree until we get to the marked node
      while (!(node.hasClass("removeAuth"))) {
        node = node.parent();
      }
      this.model.trigger("profile:removeAuth", node.attr("id"));
    },

    addEmail: function (e) {
      e.preventDefault();
      // Not yet implemented
      console.log("Not implemented.");
    },

    checkUsername: function (e) {
      var username = $("#username").val();
      $("#username-button").removeClass('btn-success');
      $("#username-button").removeClass('btn-danger');
      $("#username-button").addClass('btn-default');
      $("#username-check").removeClass('icon-ok');
      $("#username-check").removeClass('icon-remove');
      $("#username-check").addClass('icon-spin');
      $("#username-check").addClass('icon-spinner');
      $.ajax({
        url: '/api/user/username/' + username,
      }).done(function (data) {
        $("#username-check").removeClass('icon-spin');
        $("#username-check").removeClass('icon-spinner');
        $("#username-button").removeClass('btn-default');
        if (data) {
          // username is take
          $("#username-button").addClass('btn-danger');
          $("#username-check").addClass('icon-remove');
        } else {
          // username is available
          $("#username-button").addClass('btn-success');
          $("#username-check").addClass('icon-ok');
        }
      });
    },

    clickUsername: function (e) {
      e.preventDefault();
    },

    cleanup: function () {
      removeView(this);
    },

  });

  return ProfileShowView;
});

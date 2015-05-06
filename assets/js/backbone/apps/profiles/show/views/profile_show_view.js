var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var UIConfig = require('../../../../config/ui.json');
var async = require('async');
var jqIframe = require('blueimp-file-upload/js/jquery.iframe-transport');
var jqFU = require('blueimp-file-upload/js/jquery.fileupload.js');
var MarkdownEditor = require('../../../../components/markdown_editor');
var marked = require('marked');
var TagShowView = require('../../../tag/show/views/tag_show_view');
var ProfileTemplate = require('../templates/profile_show_template.html');
var EmailTemplate = require('../templates/profile_email_template.html');
var Login = require('../../../../config/login.json');
var ModalComponent = require('../../../../components/modal');
var PAView = require('./profile_activity_view');
var EmailFormView = require('../../email/views/profile_email_view');
var TagFactory = require('../../../../components/tag_factory');


var ProfileShowView = Backbone.View.extend({

  events: {
    "submit #profile-form"       : "profileSubmit",
    "click #profile-save"        : "profileSave",
    "click .link-backbone"       : linkBackbone,
    "click #profile-cancel"      : "profileCancel",
    "click #like-button"         : "like",
    "keyup #name, #title, #bio"  : "fieldModified",
    "keyup"                      : "checkName",
    "change"                     : "checkName",
    "blur"                       : "checkName",
    "click .removeAuth"          : "removeAuth"
  },

  initialize: function (options) {
    this.options = options;
    this.data = options.data;
    this.tagFactory = new TagFactory();
    this.data.newItemTags = [];
    this.edit = false;
    if (this.options.action == 'edit') {
      this.edit = true;
    }
    if (this.data.saved) {
      this.saved = true;
      this.data.saved = false;
    }
  },

  render: function () {
    var data = {
      login: Login,
      data: this.model.toJSON(),
      user: window.cache.currentUser || {},
      edit: this.edit,
      saved: this.saved,
      ui: UIConfig
    };

    data.email = (data.data.emails && data.data.emails.length) ? data.data.emails[0] : '';

    if (data.data.bio) {
      data.data.bioHtml = marked(data.data.bio);
    }
    var template = _.template(ProfileTemplate)(data);
    this.$el.html(template);
    this.$el.i18n();

    // initialize sub components
    this.initializeFileUpload();
    this.initializeForm();
    this.initializeSelect2();
    this.initializeLikes();
    this.initializeTags();
    this.initializePAView();
    this.initializeTextArea();
    this.updatePhoto();
    this.updateProfileEmail();
    return this;
  },

  initializeFileUpload: function () {
    var self = this;

    $('#fileupload').fileupload({
        url: "/api/file/create",
        dataType: 'text',
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        formData: { 'type': 'image_square' },
        add: function (e, data) {
          self.$('#file-upload-progress-container').show();
          data.submit();
        },
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          self.$('#file-upload-progress').css(
            'width',
            progress + '%'
          );
        },
        done: function (e, data) {
          var result;
          // for IE8/9 that use iframe
          if (data.dataType == 'iframe text') {
            result = JSON.parse(data.result);
          }
          // for modern XHR browsers
          else {
            result = JSON.parse($(data.result).text());
          }
          self.model.trigger("profile:updateWithPhotoId", result[0]);
        },
        fail: function (e, data) {
          // notify the user that the upload failed
          var message = data.errorThrown;
          self.$('#file-upload-progress-container').hide();
          if (data.jqXHR.status == 413) {
            message = "The uploaded file exceeds the maximum file size.";
          }
          self.$("#file-upload-alert").html(message);
          self.$("#file-upload-alert").show();
        }
    });

  },

  updateProfileEmail: function(){
    var self = this;
    $.ajax({
      url: encodeURI('/api/email/makeURL?email=contactUserAboutProfile&subject=Check Out "'+ self.model.attributes.name + '"' +
      '&profileTitle=' + (self.model.attributes.title || '') +
      '&profileLink=' + window.location.protocol + "//" + window.location.host + "" + window.location.pathname +
      '&profileName=' + (self.model.attributes.name || '') +
      '&profileLocation=' + (self.model.attributes.location ? self.model.attributes.location.name : '') +
      '&profileAgency=' + (self.model.agency ? self.model.agency.name : '')),
      type: 'GET'
    }).done( function (data) {
      self.$('#email').attr('href', data);
    });
  },

  initializeTags: function() {
    if (this.tagView) { this.tagView.cleanup(); }
    this.tagView = new TagShowView({
      model: this.model,
      el: '.tag-wrapper',
      target: 'profile',
      targetId: 'userId',
      edit: this.edit
    });
    this.tagView.render();
  },

  initializePAView: function () {
    if (this.projectView) { this.projectView.cleanup(); }
    if (this.taskView) { this.taskView.cleanup(); }
    if (this.volView) { this.volView.cleanup(); }
    $.ajax('/api/user/activities/' + this.model.attributes.id).done(function (data) {
      this.projectView = new PAView({
        model: this.model,
        el: '.project-activity-wrapper',
        target: 'project',
        handle: 'project',
        data: data.projects
      });
      this.projectView.render();
      this.taskView = new PAView({
        model: this.model,
        el: '.task-createdactivity-wrapper',
        target: 'task',
        handle: 'task',
        data: data.tasks
      });
      this.taskView.render();
      this.volView = new PAView({
        model: this.model,
        el: '.task-activity-wrapper',
        target: 'task',
        handle: 'volTask',
        data: data.volTasks
      });
      this.volView.render();

    });
  },

  updatePhoto: function () {
    var self = this;
    this.model.on("profile:updatedPhoto", function (data) {
      var url = '/api/user/photo/' + data.attributes.id;
      // force the new image to be loaded
      $.get(url, function (data) {
        $("#project-header").css('background-image', "url('" + url + "')");
        $('#file-upload-progress-container').hide();
        // notify listeners of the new user image, but only for the current user
        if (self.model.toJSON().id == window.cache.currentUser.id) {
          window.cache.userEvents.trigger("user:profile:photo:save", url);
        }
      });
    });
  },

  initializeForm: function() {
    var self = this;

    $("#topics").on('change', function (e) {
      self.model.trigger("profile:input:changed", e);
    });

    $("#skills").on('change', function (e) {
      self.model.trigger("profile:input:changed", e);
    });

    this.listenTo(self.model, "profile:save:success", function (data) {
      // Bootstrap .button() has execution order issue since it
      // uses setTimeout to change the text of buttons.
      // make sure attr() runs last
      $("#submit").button('success');
      // notify listeners if the current user has been updated
      if (self.model.toJSON().id == window.cache.currentUser.id) {
        window.cache.userEvents.trigger("user:profile:save", data.toJSON());
      }

      setTimeout(function() { $("#profile-save, #submit").attr("disabled", "disabled"); },0);
      $("#profile-save, #submit").removeClass("btn-primary");
      $("#profile-save, #submit").addClass("btn-success");
      self.data.saved = true;
      Backbone.history.navigate('profile/' + self.model.toJSON().id, { trigger: true });

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
      $("#profile-save, #submit").addClass("btn-c2");
    });
  },

  initializeLikes: function() {
    $("#like-number").text(this.model.attributes.likeCount);
    if (parseInt(this.model.attributes.likeCount) === 1) {
      $("#like-text").text($("#like-text").data('singular'));
    } else {
      $("#like-text").text($("#like-text").data('plural'));
    }
    if (this.model.attributes.like) {
      $("#like-button-icon").removeClass('fa fa-star-o');
      $("#like-button-icon").addClass('fa fa-star');
    }
  },

  initializeSelect2: function () {
    var self = this;

    var formatResult = function (object, container, query) {
      return object.name;
    };

    var modelJson = this.model.toJSON();

    var locationSettings = {
      placeholder: 'Select a Location',
      formatResult: formatResult,
      formatSelection: formatResult,
      minimumInputLength: 1,
      data: [ location ],
      createSearchChoice: function (term, values) {
        var vals = values.map(function(value) {
          return value.value.toLowerCase();
        });

        //unmatched = true is the flag for saving these "new" tags to tagEntity when the opp is saved
        return (vals.indexOf(term.toLowerCase()) >=0) ? false : {
          tagType: 'location',
          id: term,
          value: term,
          temp: true,
          name: "<b>"+term+"</b> <i>search for this location</i>"
        };
      },
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
    };

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
    if (modelJson.agency) {
      $("#company").select2('data', modelJson.agency);
    }

    $("#topics").on('change', function (e) {
      self.model.trigger("profile:input:changed", e);
    });

    $("#skills").on('change', function (e) {
      self.model.trigger("profile:input:changed", e);
    });

    $("#company").on('change', function (e) {
      self.model.trigger("profile:input:changed", e);
    });
    $('#location').select2(locationSettings).on('select2-selecting', function(e) {
      var $el = self.$(e.currentTarget),
          el = this;
      if (e.choice.temp) {
        this.temp = true;
        $('#location').select2('data', e.choice.name);
        $.get('/api/location/suggest?q=' + e.choice.value, function(d) {
          d = _(d).map(function(item) {
            return {
              id: item.name,
              text: item.name,
              name: item.name,
              unmatched: true,
              tagType: 'location',
              data: _(item).omit('name')
            };
          });
          el.reload = true;
          el.open = true;
          $('#location').select2({
            data: d,
            formatResult: function (obj) { return obj.name; },
            formatSelection: function (obj) { return obj.name; },
            createSearchChoice: function (term, values) {
              if (!values.some(function (v) {
                  return (v.name.toLowerCase().indexOf(term.toLowerCase()) >= 0);
                })) {
                return {
                  tagType: 'location',
                  id: term,
                  value: term,
                  temp: true,
                  name: "<b>" + term + "</b> <i>search for this location</i>"
                };
              }
            }
          }).select2('open');
        });
      } else {
        delete this.temp;
      }
    }).on('select2-open', function(e) {
      if (!this.reload && this.open) {
        delete this.open;
        delete this.temp;
        var cache = $("#location").select2('data');
        setTimeout(function() {
          $("#location").select2(locationSettings)
            .select2('data', cache)
            .select2('open');
        }, 0);
      } else if (this.reload && this.open) {
        delete this.reload;
      }
    });
    if (modelJson.location) {
      $("#location").select2('data', modelJson.location);
    }
    $("#location").on('change', function (e) {
      self.model.trigger("profile:input:changed", e);
    });
  },

  initializeTextArea: function () {
    if (this.md) { this.md.cleanup(); }
    this.md = new MarkdownEditor({
      data: this.model.toJSON().bio,
      el: ".markdown-edit",
      id: 'bio',
      placeholder: 'A short biography.',
      title: 'Biography',
      rows: 6
    }).render();
  },

  fieldModified: function (e) {
    this.model.trigger("profile:input:changed", e);
  },

  checkName: function (e) {
    var name = this.$("#name").val();
    if (name && name !== '') {
      $("#name").closest(".form-group").find(".help-block").hide();
    } else {
      $("#name").closest(".form-group").find(".help-block").show();
    }
  },

  profileCancel: function (e) {
    e.preventDefault();
    Backbone.history.navigate('profile/' + this.model.toJSON().id, { trigger: true });
  },

  profileSave: function (e) {
    e.preventDefault();
    $("#profile-form").submit();
  },

  profileSubmit: function (e) {
    e.preventDefault();

    // If the name isn't valid, don't put the save through
    if (validate({ currentTarget: '#name' })) {
      return;
    }

    $("#profile-save, #submit").button('loading');
    setTimeout(function() { $("#profile-save, #submit").attr("disabled", "disabled"); }, 0);

    var newTags = [].concat(
          $("#company").select2('data'),
          $("#tag_topic").select2('data'),
          $("#tag_skill").select2('data'),
          $("#tag_location").select2('data'),
          $("#location").select2('data'),
          $("#tag_agency").select2('data')
        ),
        modelTags = _(this.model.get('tags')).filter(function(tag) {
          return (tag.type !== 'agency' && tag.type !== 'location');
        }),
        data = {
          name: $("#name").val(),
          title: $("#title").val(),
          bio: $("#bio").val(),
        },
        email = this.model.get('emails')[0],
        self = this,
        tags = _(modelTags.concat(newTags)).chain()
          .filter(function(tag) {
            return _(tag).isObject() && !tag.context;
          })
          .map(function(tag) {
            return (tag.id && tag.id !== tag.name) ? +tag.id : {
              name: tag.name,
              type: tag.tagType,
              data: tag.data
            };
          }).unique().value();

    data.tags = tags;

    if ($("#profile-email").val() !== email.email) {
      $.ajax({
        url: '/api/useremail/' + email.id,
        dataType: 'json',
        method: 'put',
        data: { email: $("#profile-email").val() },
        success: function() { self.model.trigger("profile:save", data); },
        error: function() {
          var msg = 'Failed to update your email address. Please verify it ' +
                    'is a valid email address and try again.';
          $("#email-update-alert").html(msg);
          $("#email-update-alert").show();
        }
      });
    } else {
      this.model.trigger("profile:save", data);
    }
  },

  removeAuth: function (e) {
    if (e.preventDefault) e.preventDefault();
    var node = $(e.currentTarget);
    this.model.trigger("profile:removeAuth", node.data("id"));
  },

  like: function (e) {
    e.preventDefault();
    var self = this;
    var child = $(e.currentTarget).children("#like-button-icon");
    var likenumber = $("#like-number");
    // Not yet liked, initiate like
    if (child.hasClass('fa-star-o')) {
      child.removeClass('fa-star-o');
      child.addClass('fa fa-star');
      likenumber.text(parseInt(likenumber.text()) + 1);
      if (parseInt(likenumber.text()) === 1) {
        $("#like-text").text($("#like-text").data('singular'));
      } else {
        $("#like-text").text($("#like-text").data('plural'));
      }
      $.ajax({
        url: '/api/like/likeu/' + self.model.attributes.id
      }).done( function (data) {
        // liked!
        // response should be the like object
        // console.log(data.id);
      });
    }
    // Liked, initiate unlike
    else {
      child.removeClass('fa-star');
      child.addClass('fa-star-o');
      likenumber.text(parseInt(likenumber.text()) - 1);
      if (parseInt(likenumber.text()) === 1) {
        $("#like-text").text($("#like-text").data('singular'));
      } else {
        $("#like-text").text($("#like-text").data('plural'));
      }
      $.ajax({
        url: '/api/like/unlikeu/' + self.model.attributes.id
      }).done( function (data) {
        // un-liked!
        // response should be null (empty)
      });
    }
  },
  cleanup: function () {
    if (this.md) { this.md.cleanup(); }
    if (this.tagView) { this.tagView.cleanup(); }
    if (this.projectView) { this.projectView.cleanup(); }
    if (this.taskView) { this.taskView.cleanup(); }
    if (this.volView) { this.volView.cleanup(); }
    removeView(this);
  }

});

module.exports = ProfileShowView;

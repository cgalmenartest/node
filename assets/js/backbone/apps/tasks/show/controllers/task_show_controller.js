define([
  'bootstrap',
  'underscore',
  'backbone',
  'popovers',
  'utilities',
  'base_view',
  'comment_list_controller',
  'attachment_show_view',
  'task_item_view',
  'tag_show_view',
  'modal_component',
  'modal_alert',
  'task_edit_form_view'
], function (Bootstrap, _, Backbone, Popovers, utils, BaseView, CommentListController, AttachmentView, TaskItemView, TagShowView, ModalComponent, ModalAlert, TaskEditFormView) {

  var popovers = new Popovers();

  var TaskShowController = BaseView.extend({

    el: "#container",

    events: {
      'click #task-edit'                : 'edit',
      'click #task-view'                : 'view',
      "click #like-button"              : 'like',
      'click #volunteer'                : 'volunteer',
      'click #volunteered'              : 'volunteered',
      "click #task-close"               : "stateClose",
      "click #task-reopen"              : "stateReopen",
      "click .link-backbone"            : linkBackbone,
      "mouseenter .project-people-div"  : popovers.popoverPeopleOn,
      "click .project-people-div"       : popovers.popoverClick
    },

    initialize: function (options) {
      this.options = options;

      this.initializeTaskItemView();
      this.initializeChildren();

      //load user settings so they are available as needed
      this.getUserSettings(window.cache.currentUser.id);
    },

    initializeEdit: function () {
      var model = this.model.toJSON();
      // check if the user owns the task
      var owner = model.isOwner;
      if (owner !== true) {
        // if they don't own the task, do they own the project?
        if (!_.isUndefined(model.project)) {
          if (model.project.isOwner === true) {
            owner = true;
          }
        }
        // if none of these apply, are they an admin?
        if (window.cache.currentUser) {
          if (window.cache.currentUser.isAdmin === true) {
            owner = true;
          }
        }
      }
      // if not the owner, trigger the login dialog.
      if (owner !== true) {
        window.cache.userEvents.trigger("user:request:login", {
          message: "You are not the owner of this opportunity. <a class='link-backbone' href='/tasks/" + model.id + "'>View the opportunity instead.</a>",
          disableClose: true
        });
        return;
      }

      if (this.taskEditFormView) this.taskEditFormView.cleanup();
      this.taskEditFormView = new TaskEditFormView({
        el: '.edit-task-section',
        edit: true,
        taskId: this.model.attributes.id,
        model: this.model,
        tags: this.tags,
        madlibTags: this.madlibTags,
        tagTypes: this.tagTypes
      }).render();
      this.$(".task-show-madlib").hide();
      this.$(".li-task-view").show();
      this.$(".li-task-edit").hide();
      this.$(".task-view").hide();
    },

    initializeChildren: function () {
      var self = this;

      this.listenTo(this.model, 'task:show:render:done', function () {
        self.initializeHandlers();
        self.initializeLikes();

        if (self.options.action == 'edit') {
          self.initializeEdit();
        } else {
          if (window.cache.currentUser) {
            self.initializeVolunteers();
          }
          popovers.popoverPeopleInit(".project-people-div");
          if (self.commentListController) self.commentListController.cleanup();
          self.commentListController = new CommentListController({
            target: 'task',
            id: self.model.attributes.id
          });
          if (self.attachmentView) self.attachmentView.cleanup();
          self.attachmentView = new AttachmentView({
            target: 'task',
            id: this.model.attributes.id,
            owner: this.model.attributes.isOwner,
            el: '.attachment-wrapper'
          }).render();
        }

        if (self.tagView) self.tagView.cleanup();
        self.tagView = new TagShowView({
          model: self.model,
          el: '.tag-wrapper',
          target: 'task',
          targetId: 'taskId',
          edit: false,
          url: '/api/tag/findAllByTaskId/'
        }).render();

      });
    },

    initializeLikes: function () {
      $("#like-number").text(this.model.attributes.likeCount);
      if (parseInt(this.model.attributes.likeCount) === 1) {
        $("#like-text").text($("#like-text").data('singular'));
      } else {
        $("#like-text").text($("#like-text").data('plural'));
      }
      if (this.model.attributes.like) {
        $("#like-button-icon").removeClass('icon-star-empty');
        $("#like-button-icon").addClass('icon-star');
      }
    },

    initializeVolunteers: function () {
      if (this.model.attributes.volunteer) {
        $('.volunteer-true').show();
        $('.volunteer-false').hide();
      } else {
        $('.volunteer-true').hide();
        $('.volunteer-false').show();
      }
    },

    initializeHandlers: function() {
      this.listenTo(this.model, "task:update:state:success", function (data) {
        if (data.attributes.state == 'closed') {
          $("#li-task-close").hide();
          $("#li-task-reopen").show();
          $("#alert-closed").show();
        } else {
          $("#li-task-close").show();
          $("#li-task-reopen").hide();
          $("#alert-closed").hide();
        }
      });
    },
    initializeTaskItemView: function () {
      var self = this;
      // Get the tag type info from the view so we don't have to refetch
      this.listenTo(this.model, 'task:tag:types', function (data) {
        self.tagTypes = data;
      });
      this.listenTo(this.model, 'task:tag:data', function (tags, madlibTags) {
        self.tags = tags;
        self.madlibTags = madlibTags;
      });
      if (this.taskItemView) this.taskItemView.cleanup();
      this.taskItemView = new TaskItemView({
        model: this.options.model,
        router: this.options.router,
        id: this.options.id,
        el: this.el
      });
    },

    edit: function (e) {
      if (e.preventDefault) e.preventDefault();
      this.initializeEdit();
      Backbone.history.navigate('tasks/' + this.model.id + '/edit');
    },

    view: function (e) {
      if (e.preventDefault) e.preventDefault();
      Backbone.history.navigate('tasks/' + this.model.id, { trigger: true });
    },

    like: function (e) {
      if (e.preventDefault) e.preventDefault();
      var self = this;
      var child = $(e.currentTarget).children("#like-button-icon");
      var likenumber = $("#like-number");
      // Not yet liked, initiate like
      if (child.hasClass('icon-star-empty')) {
        child.removeClass('icon-star-empty');
        child.addClass('icon-star');
        likenumber.text(parseInt(likenumber.text()) + 1);
        if (parseInt(likenumber.text()) === 1) {
          $("#like-text").text($("#like-text").data('singular'));
        } else {
          $("#like-text").text($("#like-text").data('plural'));
        }
        $.ajax({
          url: '/api/like/liket/' + this.model.attributes.id
        }).done( function (data) {
          // liked!
          // response should be the like object
          // console.log(data.id);
        });
      }
      // Liked, initiate unlike
      else {
        child.removeClass('icon-star');
        child.addClass('icon-star-empty');
        likenumber.text(parseInt(likenumber.text()) - 1);
        if (parseInt(likenumber.text()) === 1) {
          $("#like-text").text($("#like-text").data('singular'));
        } else {
          $("#like-text").text($("#like-text").data('plural'));
        }
        $.ajax({
          url: '/api/like/unliket/' + this.model.attributes.id
        }).done( function (data) {
          // un-liked!
          // response should be null (empty)
        });
      }
    },
    getUserSettings: function (userId) {
      //does this belong somewhere else?
      //

      $.ajax({
        url: '/api/usersetting/'+userId,
        type: 'GET',
        dataType: 'json'
      })
      .success(function(data){
        _.each(data,function(setting){
          //save active settings to the current user object
          console.log("setting",setting);
          if ( setting.isActive ){
            window.cache.currentUser[setting.key]=setting;
          }
        });
      });
    },
    deleteSupervisorEmail: function(userId){
      var self = this;

      var targetId = window.cache.currentUser.supervisorEmail.id;

      if ( userId ){
        $.ajax({
          url: '/api/usersetting/'+targetId,
          type: 'DELETE',
          dataType: 'json'
        })
      }
    },
    saveSupervisorEmail: function(userId){
      var self = this;

      //is current value the same as the saved value? if so do nothing
      var newValue = $('#userSuperVisorEmail').val() || null;
      if ( typeof window.cache.currentUser.supervisorEmail != 'undefined' ){
        var oldValue = window.cache.currentUser.supervisorEmail.value;
      } else {
        var oldValue = null
      }

      if ( newValue == oldValue ){ return true; }

      //else save newValue
      //we're saving, so first delete previous value
      if ( oldValue ) { self.deleteSupervisorEmail(userId); }

      //then save newValue
      $.ajax({
          url: '/api/usersetting/',
          type: 'POST',
          dataType: 'json',
          data: {
            userId: userId,
            key: 'supervisorEmail',
            value: newValue
          }
        });
    },

    volunteer: function (e) {
      if (e.preventDefault) e.preventDefault();
      var self = this;
      var child = $(e.currentTarget).children("#like-button-icon");

      if (this.modalAlert) { this.modalAlert.cleanup(); }
      if (this.modalComponent) { this.modalComponent.cleanup(); }
      this.modalComponent = new ModalComponent({
        el: "#modal-volunteer",
        id: "check-volunteer",
        modalTitle: "Do you want to volunteer?"
      }).render();

    if ( window.cache.currentUser.supervisorEmail ){
       //not assigning as null because null injected into the modalContent var shows as a literal value
       //    when what we want is nothing if value is null
        var supervisorEmail = window.cache.currentUser.supervisorEmail.value ;
      } else {
        var supervisorEmail = "";
      }

    console.log("sup email",window.cache.currentUser);
    if ( true ) {
        var modalContent = '<p>I understand it is my responsibility to confirm supervisor approval prior to committing to an opportunity.</p><p>Once you volunteer for an opportunity, you will not be able to cancel your commitment to volunteer.</p><p>Below, enter the email address of your supervisor so that they may be notified of your interest in this opportunity. If you\'ve previously volunteered, the last supervisor email your provided is shown.<br/><input type="text" id="userSuperVisorEmail" placeholder="Enter an email address" value="'+supervisorEmail+'"/>';
      } else {
        var modalContent = '<p>I understand it is my responsibility to confirm supervisor approval prior to committing to an opportunity.</p><p>Once you volunteer for an opportunity, you will not be able to cancel your commitment to volunteer.</p>';
      }

      this.modalAlert = new ModalAlert({
        el: "#check-volunteer .modal-template",
        modalDiv: '#check-volunteer',
        content: modalContent,
        cancel: 'Cancel',
        submit: 'I Agree',
        callback: function (e) {
          self.saveSupervisorEmail(window.cache.currentUser.id);
          // user clicked the submit button
          $.ajax({
            url: '/api/volunteer/',
            type: 'POST',
            data: {
              taskId: self.model.attributes.id
            }
          }).done( function (data) {
            $('.volunteer-true').show();
            $('.volunteer-false').hide();
            var html = '<div class="project-people-div" data-userid="' + data.userId + '"><img src="/api/user/photo/' + data.userId + '" class="project-people"/></div>';
            $('#task-volunteers').append(html);
            popovers.popoverPeopleInit(".project-people-div");
          });
        }
      }).render();
    },

    volunteered: function (e) {
      if (e.preventDefault) e.preventDefault();
      // Not able to un-volunteer, so do nothing
    },

    stateClose: function (e) {
      if (e.preventDefault) e.preventDefault();
      var self = this;

      if (this.modalAlert) { this.modalAlert.cleanup(); }
      if (this.modalComponent) { this.modalComponent.cleanup(); }
      this.modalComponent = new ModalComponent({
        el: "#modal-close",
        id: "check-close",
        modalTitle: "Close Opportunity"
      }).render();

      this.modalAlert = new ModalAlert({
        el: "#check-close .modal-template",
        modalDiv: '#check-close',
        content: '<p>Are you sure you want to close this opportunity?  Once the opportunity is closed, volunteers will no longer be able to contribute.</p>',
        cancel: 'Cancel',
        submit: 'Close Opportunity',
        callback: function (e) {
          // user clicked the submit button
          self.model.trigger("task:update:state", 'closed');
        }
      }).render();
    },

    stateReopen: function (e) {
      if (e.preventDefault) e.preventDefault();
      this.model.trigger("task:update:state", 'public');
    },

    cleanup: function () {
      if (this.taskEditFormView) this.taskEditFormView.cleanup();
      if (this.tagView) { this.tagView.cleanup(); }
      if (this.attachmentView) { this.attachmentView.cleanup(); }
      if (this.commentListController) { this.commentListController.cleanup(); }
      if (this.taskItemView) { this.taskItemView.cleanup(); }
      removeView(this);
    }

  });

  return TaskShowController;
})
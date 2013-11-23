// Here I  will attempt to keep all the logic for tags in the controller
// and not in the view layer.  If this works then we can move
// the project view tag methods out to the controller as it should be.

define([
  'bootstrap',
  'underscore',
  'backbone',
  'base_view',
  'comment_list_controller',
  'attachment_show_view',
  'task_item_view',
  'tag_show_view',
  'task_edit_form_view'
], function (Bootstrap, _, Backbone, BaseView, CommentListController, AttachmentView, TaskItemView, TagShowView, TaskEditFormView) {

  var TaskShowController = BaseView.extend({

    el: "#container",

    events: {
      'click .edit-task'                : 'edit',
      "click #like-button"              : 'like'
    },

    initialize: function (options) {
      this.options = options;

      this.initializeTaskItemView();
      this.initializeChildren();
    },

    initializeChildren: function () {
      var self = this;

      this.listenTo(this.model, 'task:show:render:done', function () {
        self.initializeLikes();

        if (self.commentListController) self.commentListController.cleanup();
        self.commentListController = new CommentListController({
          target: 'task',
          id: self.model.id
        });

        if (self.tagView) self.tagView.cleanup();
        self.tagView = new TagShowView({
          model: self.model,
          el: '.tag-wrapper',
          target: 'task',
          targetId: 'taskId',
          edit: false,
          url: '/api/tag/findAllByTaskId/'
        }).render();

        if (self.attachmentView) self.attachmentView.cleanup();
        self.attachmentView = new AttachmentView({
          target: 'task',
          id: this.model.attributes.id,
          owner: this.model.attributes.isOwner,
          el: '.attachment-wrapper'
        }).render();
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
        $("#like-button-icon").removeClass('icon-star-empty');
        $("#like-button-icon").addClass('icon-star');
      }
    },

    initializeTaskItemView: function () {
      var self = this;

      if (this.taskItemView) this.taskItemView.cleanup();
      this.taskItemView = new TaskItemView({
        model: self.options.model,
        router: self.options.router,
        id: self.options.id,
        el: self.el
      });
    },

    edit: function (e) {
      if (e.preventDefault) e.preventDefault();
      var self = this;

      if (this.taskEditFormView) this.taskEditFormView.cleanup();
      this.taskEditFormView = new TaskEditFormView({
        el: '.edit-task-section',
        model: self.model
      }).render();
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

    cleanup: function () {
      if (this.tagView) { this.tagView.cleanup(); }
      if (this.attachmentView) { this.attachmentView.cleanup(); }
      if (this.commentListController) { this.commentListController.cleanup(); }
      if (this.taskItemView) { this.taskItemView.cleanup(); }
      removeView(this);
    }

  });

  return TaskShowController;
})
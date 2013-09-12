define([
	'jquery',
	'underscore',
	'backbone',
	'base_controller',
	'project_item_view',
	'task_list_controller',
	'comment_list_controller',
	'comment_form_view',
], function ($, _, Backbone, BaseController, ProjectItemView, TaskListController, CommentListController, CommentFormView) {

	Application.Project = {};

	Application.Project.ShowController = BaseController.extend({

		el: "#container",

		// Set the model to null, before it is fetched from the server.
		// This allows us to clear out the previous data from the list_view, 
		// and get ready for the new data for the project show view.
		model: null,

		events: {
			"click .edit-project"   : "edit",
			"click #like-button"    : "like",
			"change #project-state" : "updateState",
			"mouseenter .project-people-div" : "peopleOn",
			"mouseleave .project-people-div" : "peopleOff",
			"click .project-people" : "peopleOn"
		},

		// The initialize method is mainly used for event bindings (for effeciency)
		initialize: function () {
			var self = this;
			
			this.model.trigger("project:model:fetch", this.model.id);	
			this.listenTo(this.model, "project:model:fetch:success", function (model) {
				this.model = model;
				self.initializeItemView();
			});

			rendering.on("project:show:rendered", function () {
				self.initializeItemViewControllers();	
				self.initializeLikes();
				self.initializeHandlers();
				self.initializeUI();
			});
		},

		initializeItemView: function () {
			var self = this;

			if (this.projectShowItemView) this.projectShowItemView.cleanup();
			this.projectShowItemView  = new ProjectItemView({ model: this.model }).render();
		},

		initializeItemViewControllers: function () {
			if (this.taskListController) this.taskListController.cleanup();
			this.taskListController = new TaskListController({ projectId: this.model.id });

			if (this.commentListController) this.commentListController.cleanup();
			this.commentListController = new CommentListController({ projectId: this.model.id })
			
			if (this.commentForm) this.commentForm.cleanup();
			this.commentForm = new CommentFormView({ projectId: this.model.id });
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

		initializeHandlers: function() {
			this.listenTo(this.model, "project:update:state:success", function (data) {
				$("#project-admin-state").button('reset');
			});
		},

		initializeUI: function() {
			$(".project-people-div").popover(
				{
					placement: 'auto top',
					trigger: 'manual',
					html: 'true',
					title: 'load',
					content: '<div class="popover-spinner"><div class="loading">Fetching Information</div><i class="icon-spinner icon-spin"></i></div>',
					template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title" style="display:none; visibility:hidden"></h3><div class="popover-content"></div></div>'
				});
		},

		edit: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var self = this;

			if (this.modalComponent) this.modalComponent;
			this.modalComponent = new ModalComponent({
				el: "#container",
				id: "editProject",
				modalTitle: "Edit Project"
			}).render();

			if (!_.isUndefined(this.modalComponent)) {
				if (this.projectEditFormView) this.projectEditForm();
				this.projectEditFormView = new ProjectEditFormView({
					el: ".modal-body",
					model: self.model
				}).render();
			}
		},

		updateState: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var self = this;
			var state  = $(e.currentTarget).val();
			console.log(state);
			$("#project-admin-state").button('loading');
			this.model.trigger("project:update:state", state);
		},

		like: function (e) {
			if (e.preventDefault()) e.preventDefault();
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
					url: '/like/like/' + this.model.attributes.id
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
					url: '/like/unlike/' + this.model.attributes.id
				}).done( function (data) {
					// un-liked!
					// response should be null (empty)
				});
			}
		},

		delete: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var model, title;

			attr = $(e.currentTarget).closest(".project-title").children(".project").text();
			model = getCurrentModelFromFormAttributes(this.collection, attr);

			model.destroy();
			this.renderProjectCollectionView();
		},

		peopleOn: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var self = this;
			var target = $(e.currentTarget);
			var popover = target.data('bs.popover');
			target.popover('show');
			// Only load data if the popover hasn't previously been loaded
			if (popover.options.title == 'load') {
				$.ajax({ url: '/user/info/' + target.data('userid') }).done(function(data) {
					data.company = 'General Services Administration';
					data.title = 'Presidential Innovation Fellow';
					popover.options.title = 'done';
					popover.options.content = '<img align="left" src="/user/photo/' + data.id + '" class="project-people-popover"/><div class="popover-person"><div class="title">' + data.name + '</div>' + data.title + '<br/>' + data.company + '</div>';
					popover.setContent();
					popover.$tip.addClass(popover.options.placement);
				});
			}

		},

		peopleOff: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var self = this;
			var target = $(e.currentTarget);
			target.popover('hide');
		},

		// ---------------------
		//= Utility Methods
		// ---------------------
		cleanup: function() {
		  $(this.el).remove();
		}

	});

	return Application.Project.ShowController;
});
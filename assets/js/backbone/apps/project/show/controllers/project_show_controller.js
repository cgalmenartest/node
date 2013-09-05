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
			"click .edit-project": "edit"
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

		delete: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var model, title;

			attr = $(e.currentTarget).closest(".project-title").children(".project").text();
			model = getCurrentModelFromFormAttributes(this.collection, attr);

			model.destroy();
			this.renderProjectCollectionView();
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
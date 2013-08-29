define([
	'underscore',
	'backbone',
	'bootstrap',
	'utilities',
	'base_controller',
	'projects_collection',
	'projects_collection_view',
	'projects_show_controller',
	'project_form_view',
	'projects_app',
	'task_list_controller',
	'comment_list_controller',
	'comment_form_view'
], function (
	_, Backbone, Bootstrap, Utilities, BaseController, 
	ProjectsCollection, ProjectsCollectionView, ProjectShowController, 
	ProjectFormView, ProjectApp, TaskListController, CommentListController,
	CommentFormView) {
	
	Application.Project.ListController = BaseController.extend({

		el: "#container",

		events: {
			"click .project"				: "show",
			"click .add-project"		: "add",
			"click .delete-project"	: "delete",
			"click .edit-project"		: "edit"
		},

		initialize: function () {
			var self = this;
			this.fireUpProjectsCollection();
			this.bindToProjectFetchListeners();
			this.collection.trigger("projects:fetch");

			this.listenTo(this.collection, "project:save:success", function () {
				$(".modal-backdrop").hide();
      	$(".modal").modal('hide');
      	self.renderProjectCollectionView();
			})
		},

		fireUpProjectsCollection: function () {
			if (this.collection) {
				this.collection;
			} else {
				this.collection = new ProjectsCollection();
			}
		},

		bindToProjectFetchListeners: function () {
			var self = this;
			this.listenToOnce(this.collection, "projects:fetch", function () {
				self.collection.fetch({
					success: function (collection) {
						self.renderProjectCollectionView(collection);
					}
				})
			})
		},

		renderProjectCollectionView: function (collection) {
			this.projectCollectionView ?	
				this.projectCollectionView.render() :
				this.projectCollectionView = new ProjectsCollectionView({
					el: "#container",
					onRender: true,
					collection: collection
				}).render();
		},

		show: function (e) {
			if (e.preventDefault()) e.preventDefault();

			var id, model;

			// Grab the id for the model nearest the click
			id = $(e.currentTarget).closest('li[data-project-id]').attr('data-project-id')	

			// // Store the model as the return of this utility function.
			model = getCurrentModelFromId(this.collection, id);

			if (this.projectShowController) {
				this.projectShowController.cleanup();
			}
			this.projectShowController = new ProjectShowController({ model: model })

			// Backbone.history.navigate('projects/' + id, { trigger: true })
			
			rendering.on("project:show:rendered", function () {
				if (this.taskListController) {
					this.taskListController.cleanup();
				}
				this.taskListController = new TaskListController({ projectId: id });

				if (this.commentListController) {
					this.commentListController.cleanup();
				}
				this.commentListController = new CommentListController({ projectId: id })

				if (this.commentForm) {
					this.commentForm.cleanup();
				}
				this.commentForm = new CommentFormView({ projectId: id });
			});

		},

		add: function (e) {
			if (e.preventDefault()) e.preventDefault();

			// Don't need to instantiate collection -again- in this view,
			// simply pass it down.
			if (this.projectFormView) {
				this.projectFormView.cleanup();
			}
			
			this.projectFormView = new ProjectFormView({
				el: "#project-form-wrapper",
				collection: this.collection
			}).render();
		
		},

		delete: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var model;

			id = $(e.currentTarget).closest('li[data-project-id]').attr('data-project-id')	
			model = getCurrentModelFromId(this.collection, id);

			model.destroy();
			this.renderProjectCollectionView();
		},

		cleanup: function() {
		  $(this.el).remove();
		}

	});

	return Application.Project.ListController;
})
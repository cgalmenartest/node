// This is the Project Application Module or AppModule.
// Here we are going to fire up all the regions we need to exert
// Some control over, in an incredibly safe maner.

define([
	'underscore',
	'backbone',
	'base_app_module',
	'project_list_controller',
	'task_list_controller'
], function (_, Backbone, BaseAppModule, ProjectListController, TaskListController) {
	
	Application.AppModule.Project = BaseAppModule.extend({

		initialize: function () {
			this.rendered = true;
			this.initializeProjectListController();
			// Psudo-Event
			this.onProjectShowRender();

		},

		initializeProjectListController: function () {
			this.initializeControllerSafely(this.rendered, ProjectListController);
		},

		onProjectShowRender: function () {
			var self = this;
			rendering.on("project:show", function (projectId) {

				if (this.taskListController) {
					this.taskListController.cleanup();
				}
				this.taskListController = new TaskListController({ projectId: projectId });

			});
		}


	});

	return Application.AppModule.Project;
})
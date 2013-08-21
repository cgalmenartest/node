// This is the Project Application Module or AppModule.
// Here we are going to fire up all the regions we need to exert
// Some control over, in an incredibly safe maner.

define([
	'underscore',
	'backbone',
	'base_app_module',
	'project_list_controller'
], function (_, Backbone, BaseAppModule, ProjectListController) {
	
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
			rendering.on("project:show", function () {

				self.initializeControllerSafely(self.rendered, TaskListController);
				
				// Here we put the logic for the show view that we want in the app delegate for this area.
				// For instance we want task lists controller to be instantiated but we dont want to do that on the 
				// projects controller.
				console.log("project show has been rendered, and is ready to instantiate controllers for this area.");


			});
		}



	});

	return Application.AppModule.Project;
})
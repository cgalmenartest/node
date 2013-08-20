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
			this.initializeControllerSafely(this.rendered, ProjectListController);
		}

	});

	return Application.AppModule.Project;
})
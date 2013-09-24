define([
	'jquery',
	'underscore',
	'async',
	'backbone',
	'popovers',
	'base_controller',
	'project_item_view',
	'task_list_controller',
	'event_list_controller',
	'comment_list_controller',
	'comment_form_view',
	'modal_component',
	'tag_form_view',
	'autocomplete'
], function ($, _, async, Backbone, Popovers, BaseController, ProjectItemView,
	TaskListController, EventListController, CommentListController, CommentFormView,
	ModalComponent, TagFormView, autocomplete) {

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
			"click #tag-create"     : "tagCreate",
			"click #tag-save"       : "tagSave",
			"click .tag-delete"     : "tagDelete",
			"change #project-state" : "updateState",
			"mouseenter .project-people-div" : popoverPeopleOn,
			"mouseleave .project-people-div" : popoverPeopleOff,
			"click .project-people-div" : popoverPeopleOn,
			"keyup .comment-content": "search"
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
				self.initializeHandlers();
				self.initializeLikes();
				self.initializeUI();
			});

		},

		search: function () {
			$(".comment-content").midasAutocomplete({
				backboneEvents: true,
				// If we are using backbone here, then a lot of these 
				// misc. AJAX options we are passing are unecessary.  So we should somehow
				// manage that in an elegant way.  
				backbone: false,
				apiEndpoint: '/ac/inline',
				// the query param expects one api endpoint IE:
				// /nested/endpoint?QUERYPARAM=$(".search").val()
				// So it is not something that you can chain params onto.  
				// It expects you to send the data back as input data through that query param
				// one character at a time.  
				queryParam: 'q',
				type: 'POST',
				contentType: 'json',

				// The plugin will accept any trigger key'd in here, and then
				// use that to start the search process.  if it doesn't exist it will not search.
				trigger: "@",
				searchResultsClass: ".search-result-wrapper",

				success: function (data) {

				}
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

			if (this.eventListController) this.eventListController.cleanup();
			this.eventListController = new EventListController({ projectId: this.model.id })

			if (this.commentListController) this.commentListController.cleanup();
			this.commentListController = new CommentListController({ projectId: this.model.id })
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
			popoverPeopleInit(".project-people-div");
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
					el: ".modal-template",
					model: self.model
				}).render();
			}
		},

		updateState: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var self = this;
			var state  = $(e.currentTarget).val();
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

		tagCreate: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var self = this;

			// Pop up dialog box to create tag,
			// then put tag into the select box
      this.modalComponent = new ModalComponent({
        el: "#container",
        id: "createTag",
        modalTitle: "Create Tag"
      }).render();

      if (!_.isUndefined(this.modalComponent)) {
        this.tagFormView = new TagFormView({
          el: ".modal-template",
          model: self.model
        });
        this.tagFormView.render();
      }
		},

		tagSave: function (e) {
			// Cycle through tags in select box
			// and call create on each one, then
			// render
			$("#tag-save").addClass('disabled');
			var self = this;
			var data = $("#input-tags").select2('data');
			var result = [];

			var processTag = function(tag, done) {
				var tagMap = {
					tagId: tag.id,
					projectId: self.model.id
				};
				$.ajax({
					url: '/tag',
					type: 'POST',
					data: tagMap
				}).done(function (data) {
					result.push(data);
					done();
				});
			};

			async.each(data, processTag, function (err) {
				for (var i = 0; i < result.length; i++) {
					for (var j = 0; j < data.length; i++) {
						if (result[i].tagId == data[j].id) {
							result[i].tag = data[j];
							break;
						}
					}
				}
				console.log('done!');
				console.log(result);
				$("#tag-save").removeClass('disabled');
				self.model.trigger("project:tag:save", result);
			});

		},

		tagDelete: function (e) {
			// Get the data-id of the currentTarget
			// and then call HTTP DELETE on that tag id
			console.log(e);
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

define([
	'jquery',
	'underscore',
	'async',
	'backbone',
	'utilities',
	'popovers',
	'base_controller',
	'project_item_view',
	'task_list_controller',
	'event_list_controller',
	'comment_list_controller',
	'comment_form_view',
	'modal_component',
	'autocomplete'
], function ($, _, async, Backbone, utils, Popovers, BaseController, ProjectItemView,
	TaskListController, EventListController, CommentListController, CommentFormView,
	ModalComponent, autocomplete) {

	var popovers = new Popovers();

	Application.Project = {};

	Application.Project.ShowController = BaseController.extend({

		el: "#container",

		// Set the model to null, before it is fetched from the server.
		// This allows us to clear out the previous data from the list_view,
		// and get ready for the new data for the project show view.
		model: null,

		events: {
			"click .edit-project"   					: "edit",
			"click #like-button"    					: "like",
			"keyup .comment-content"					: "search",
			"click button.owner-form-toggle"			: "toggleOwners",
			//"click button.participant-form-toggle"		: "toggleParticipants",
			//"keyup .participant-form"					: "userSearch",
			"click #owner-save"							: "saveOwners",
			//"click #participant-save"					: "addParticipants",
			"click #tag-save"       					: "tagSave",
			"click #tag-create"     					: "tagCreate",
			"click .tag-delete"     					: "tagDelete",
			"change #project-state" 					: "updateState",
			"mouseenter .project-people-div" 	: popovers.popoverPeopleOn,
		},

		// The initialize method is mainly used for event bindings (for effeciency)
		initialize: function () {
			var self = this;
			//this.participants = [];

			this.model.trigger("project:model:fetch", this.model.id);
			this.listenTo(this.model, "project:model:fetch:success", function (model) {
				this.model = model;
				self.initializeItemView();
			});

			this.model.on("project:show:rendered", function () {
				self.initializeItemViewControllers();
				self.initializeHandlers();
				self.initializeLikes();
				self.initializeUI();
				//self.initializeParticipantSelect2();
				self.initializeOwnerSelect2();
				//self.InitializeParticipants();

			});
			// console.log(cache.currentUser);

			//console.log(self.model);
		},

		search: function () {
			$(".comment-content").midasAutocomplete({
				backboneEvents: true,
				// If we are using backbone here, then a lot of these
				// misc. AJAX options we are passing are unecessary.  So we should somehow
				// manage that in an elegant way.
				backbone: false,
				apiEndpoint: '/api/ac/inline',
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
			this.taskListController = new TaskListController({ projectId: this.model.id });

			this.eventListController = new EventListController({ projectId: this.model.id })

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
			popovers.popoverPeopleInit(".project-people-div");
		},


	initializeOwnerSelect2: function () {
    	var self = this;
      	var formatResult = function (object, container, query) {
        	return object.name;
      	};

		var modelJson = this.model.toJSON();
		//console.log(modelJson);
		$("#owners").select2({
		    placeholder: 'Select Project Owners',
		    multiple: true,
		    formatResult: formatResult,
		    formatSelection: formatResult,
		    minimumInputLength: 1,
		    ajax: {
		      	url: '/api/ac/user',
		      	dataType: 'json',
		      	data: function (term) {
		        	return {
		         		q: term
		        	};
		      	},
		      	results: function (data) {
		        	return { results: data };
		    	}
	    	}
	  	});

			// var owners = [];

			// _.each(this.model.attributes.owners, self.recreateUserFromID);

		//$("#participants").select2('data', [{field:"name", id:1,name:"Dan Kottke", target:"user", value: "Dan Kottke"}]);

		//$("#owners").select2("data",this.model.attributes.owners);

   //  	$("#participants").on('change', function (e) {
   //  		self.model.trigger("project:input:changed", e);
			// });
	  	$('#project-owners-form').hide();
	  	$('#project-owners-show').show();
	  	$('#owner-edit').show();
	  	$('#owner-save').hide();




		// if (modelJson.agency) {
  //       	$("#company").select2('data', modelJson.agency.tag);
  //     	}

		//var s2data = $("#participants").select2("data");

	  	///$("#test_button").on('click', function(e){if (e.preventDefault) e.preventDefault();alert(data);});
    },






		edit: function (e) {
			if (e.preventDefault) e.preventDefault();
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
			if (e.preventDefault) e.preventDefault();
			var self = this;
			var state  = $(e.currentTarget).val();
			$("#project-admin-state").button('loading');
			this.model.trigger("project:update:state", state);
		},

		toggleOwners : function(e){
			$('.owner-form-toggle').toggle(400);
		},



		saveOwners : function(e){
			if (e.preventDefault) e.preventDefault();
			var self = this;
			var oldOwners = this.model.attributes.owners || [];
			var s2data = $("#owners").select2("data")  || [];
			var oldOwnerIds = _.map(oldOwners, function(owner){ return owner.userId }) || [];
			var s2OwnerIds = _.map(s2data, function(owner){ return owner.id }) || [];

			var newOwnerIds = _.difference(s2OwnerIds, oldOwnerIds) || [];
			var removeOwnerIds = _.difference(oldOwnerIds, s2OwnerIds) || [];
			//makes it so you can't remove yourself as owner. Can debate this point later.
			removeOwnerIds = _.filter(removeOwnerIds, function(userId){ return !(cache.currentUser.id === userId); }, this)  || [];


			var removeOwners = _.filter(oldOwners, function(owner){ return _.indexOf( removeOwnerIds, owner.userId) >= 0 ? true : false; } , this)  || [];
			var removePOIds = _.map( removeOwners, function(owner){ return owner.id } )  || [];
			_.each(newOwnerIds, this.createOwner, self);
			_.each(removePOIds, this.removeOwner, self);

		},

		createOwner : function(ownerID){
			var self = this;
			//var ownerID = owner.id;
			//var owners = this.model.owners || [];
			$.ajax({
					url: '/api/projectowner/',
					type: 'POST',
					data: {
						projectId: self.model.attributes.id,
						userId: ownerID
					},
					success : function(data){

						//newOwners.push(data);
						// this.model.set('owners',owners)

					}

				}).done(function (result) {
				});
		},

		removeOwner: function (pOID) {
				var self = this;
				$.ajax({
				url: '/api/projectowner/' + pOID,
				type: 'DELETE',
				}).done(function (data) {
				});
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
					url: '/api/like/like/' + this.model.attributes.id
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
					url: '/api/like/unlike/' + this.model.attributes.id
				}).done( function (data) {
					// un-liked!
					// response should be null (empty)
				});
			}
		},

		delete: function (e) {
			if (e.preventDefault) e.preventDefault();
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
			if (this.taskListController) this.taskListController.cleanup();
			if (this.eventListController) this.eventListController.cleanup();
			if (this.commentListController) this.commentListController.cleanup();
			if (this.projectShowItemView) this.projectShowItemView.cleanup();
			removeView(this);
		}

	});

	return Application.Project.ShowController;
});
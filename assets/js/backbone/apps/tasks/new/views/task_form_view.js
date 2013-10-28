define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'tasks_collection',
    'text!task_form_template',
    'tag_show_view'
], function ($, Bootstrap, _, Backbone, TasksCollection, TaskFormTemplate, TagShowView) {

	var TaskFormView = Backbone.View.extend({

		el: "#task-list-wrapper",

		template: _.template(TaskFormTemplate),

		events: {
      "submit #task-form"     : "post",
      "change #task-location" : "locationChange"
		},

		initialize: function () {
			this.options = _.extend(this.options, this.defaults);
      this.tasks = this.options.tasks;
		},

		render: function () {
			this.$el.html(this.template);
      // On rendering event make sure to hide all sections
      // that are not the current section.
      $("section:not(.current)").hide();
      this.initializeSelect2();
      this.initializeTags();
		},

    post: function (e) {
      if (e.preventDefault) e.preventDefault();

      var taskData = {
        title       : $("#task-title").val(),
        projectId   : this.options.projectId,
        description : $("#task-description").val()
      };

      var tagData = {
        topics                 : $("#task-topics").val(),
        skills                 : $("#task-skills").val(),
        teamSize               : $("#task-team-size").val(),
        typeOfTimeRequired     : $("#task-type-of-time-required").val(),
        classNetAccessRequired : $("#task-classnet-access").val()
      };

      this.tasks.trigger("task:save", taskData);

      // Save taskData and tagData seperately, as they relate, but perhaps
      // do so in Collection.
      //
      // If we do so in collection we can save the the tags with the taskId.
      // as that is when we are initializing the new model for tasks.
      // $.ajax({
      //   url: '/api/tag/add',
      //   type: 'POST',
      //   data: tagData,
      //   success: function (result) {
      //     this.tasks.model.trigger("task:tag:new", result);
      //   }
      // })

    },


    initializeSelect2: function () {
      var self = this;

      var formatResult = function (obj, container, query) {
        return obj.name;
      };


      // ------------------------------ //
      //  DROP DOWNS REQUIRING A FETCH  //
      // ------------------------------ //
      $("#skills").select2({
        placeholder: "skills",
        formatResult: formatResult,
        width: '220px',
        multiple: true,
        formatSelection: formatResult,
        ajax: {
          url: '/api/ac/tag',
          dataType: 'json',
          data: function (term) {
            return {
              type: 'skill',
              q: term
            };
          },
          results: function (data) {
            console.log(data);
            return { results: data }
          }
        }
      });

      // Topics select 2
      $("#topics").select2({
        placeholder: "topics",
        formatResult: formatResult,
        formatSelection: formatResult,
        multiple: true,
        ajax: {
          url: '/api/ac/tag',
          dataType: 'json',
          data: function (term) {
            return {
              type: 'topic',
              q: term
            };
          },
          results: function (data) {
            console.log(data);
            return { results: data }
          }
        }
      });


      // ------------------------------ //
      // PRE-DEFINED SELECT MENUS BELOW //
      // ------------------------------ //
      $("#skills-required").select2({
        placeholder: "required/not-required",
        width: '130px'
      });

      $("#time-required").select2({
        width: '130px'
      });

      $("#people").select2({
        width: '130px'
      });

      $("#length").select2({
        width: '130px'
      });

      $("#time-estimate").select2({
        width: '200px'
      });

      $("#task-location").select2();
    },

    locationChange: function (e) {
      if (_.isEqual(e.currentTarget.value, "a specific location")) {
        $(".el-specific-location").show();
      }
    },

    initializeTags: function () {
      var self = this;
      this.tagView = new TagShowView({
        model: self.model,
        el: ".tag-wrapper",
        target: "task",
        url: '/api/tag/findAllByTaskId/'
      });
      this.tagView.render();
    },

    cleanup: function () {
      removeView(this);
    }

	});

	return TaskFormView;

});

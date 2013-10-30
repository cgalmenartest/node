define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'async',
    'tasks_collection',
    'text!task_form_template',
    'tag_show_view'
], function ($, Bootstrap, _, Backbone, async, TasksCollection, TaskFormTemplate, TagShowView) {

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
      var self = this;

      var taskData = {
        title       : $("#task-title").val(),
        projectId   : this.options.projectId,
        description : $("#task-description").val()
      };

      var tags = [
        $("#topics").select2('data'),
        $("#skills").select2('data'),
        $("#skills-required").select2('data'),
        $("#people").select2('data'),
        $("#time-required").select2('data'),
        $("#length").select2('data'),
        $("#time-estimate").select2('data'),
        $("#task-location").select2('data'),
        $("#input-specific-location").val(),
        $("#task-classnet-access").select2('data')
      ];

      this.tasks.trigger("task:save", taskData);

      this.listenTo(this.tasks, "task:save:success", function (taskId) {

        var addTag = function (tag, done) {
          if (!tag || !tag.id) return done();
          if (tag.tagId) return done();

          var tagMap = {
            taskId: taskId,
            tagId: tag.id
          }

          $.ajax({
            url: '/api/tag',
            type: 'POST',
            data: tagMap,
            success: function (data) {
              done();
            },
            error: function (err) {
              throw new Error("error");
            }
          });
        }

        async.each(tags, addTag, function (err) {
          return self.model.trigger("task:tags:save:success", err);
        });

      });

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

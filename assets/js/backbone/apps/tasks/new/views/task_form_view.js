define([
    'jquery',
    'bootstrap',
    'underscore',
    'backbone',
    'async',
    'utilities',
    'tasks_collection',
    'text!task_form_template'
], function ($, Bootstrap, _, Backbone, async, utilities, TasksCollection, TaskFormTemplate) {

	var TaskFormView = Backbone.View.extend({

		el: "#task-list-wrapper",

		events: {
      "change #task-location" : "locationChange"
		},

		initialize: function () {
			this.options = _.extend(this.options, this.defaults);
      this.tasks = this.options.tasks;
      this.initializeSelect2Data();
      this.initializeListeners();
		},

    initializeSelect2Data: function () {
      var self = this;
      var types = ["task-skills-required", "task-time-required", "task-people", "task-length", "task-time-estimate"];

      this.tagSources = {};

      var requestAllTagsByType = function (type) {
        $.ajax({
          url: '/api/ac/tag?type=' + type + '&list',
          type: 'GET',
          async: false,
          success: function (data) {
            self.tagSources[type] = data;
          }
        });
      }

      async.each(types, requestAllTagsByType, function (err) {
        self.render();
      });
    },

    initializeListeners: function() {
      var self = this;

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
              done(err);
            }
          });
        };

        // Gather tags for submission after the task is created
        tags = [];
        tags.push.apply(tags, $("#topics").select2('data'));
        tags.push.apply(tags, $("#skills").select2('data'));
        tags.push($("#skills-required").select2('data'));
        tags.push($("#people").select2('data'));
        tags.push($("#time-required").select2('data'));
        tags.push($("#time-estimate").select2('data'));
        tags.push($("#length").select2('data'));

        async.each(tags, addTag, function (err) {
          self.model.trigger("task:modal:hide");
          return self.model.trigger("task:tags:save:success", err);
        });

      });
    },

		render: function () {
      var template = _.template(TaskFormTemplate, { tags: this.tagSources })
			this.$el.html(template);
      this.initializeSelect2();

      // Important: Hide all non-currently opened sections of wizard.
      // TODO: Move this to the modalWizard js.
      $("section:not(.current)").hide();

      // Return this for chaining.
      return this;
		},

    submit: function (e, data) {
      console.log('post');
      // nothing necessary to do here.
      // non-null, non-false return continues processing
      return this;
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
        width: '220px',
        multiple: true,
        formatResult: formatResult,
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
            return { results: data }
          }
        }
      });

      // Topics select 2
      $("#topics").select2({
        placeholder: "topics",
        width: '220px',
        multiple: true,
        formatResult: formatResult,
        formatSelection: formatResult,
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
            return { results: data }
          }
        }
      });

      // ------------------------------ //
      // PRE-DEFINED SELECT MENUS BELOW //
      // ------------------------------ //
      $("#skills-required").select2({
        placeholder: "required/not-required",
        width: '200px'
      });

      $("#time-required").select2({
        placeholder: 'time-required',
        width: '130px'
      });

      $("#people").select2({
        placeholder: 'people',
        width: '150px'
      });

      $("#length").select2({
        placeholder: 'length',
        width: '130px'
      });

      $("#time-estimate").select2({
        placeholder: 'time-estimate',
        width: '200px'
      });

      $("#task-location").select2({
        placeholder: 'length',
        width: '130px'
      });

    },

    locationChange: function (e) {
      if (_.isEqual(e.currentTarget.value, "a specific location")) {
        $(".el-specific-location").show();
      } else if (!_.isEqual(e.currentTarget.value, "a specific location")) {
        $(".el-specific-location").hide();
      }
    },

    cleanup: function () {
      removeView(this);
    }

	});

	return TaskFormView;

});

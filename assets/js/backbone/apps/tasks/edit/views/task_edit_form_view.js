define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!task_edit_form_template'
], function ($, _, Backbone, utilities, TaskEditFormTemplate) {

  var TaskEditFormView = Backbone.View.extend({

    events: {
      'click #task-view'      : 'view',
      'submit #task-edit-form': 'submit'
    },

    initialize: function (options) {
      this.options = options;
    },

    view: function () {
      if (e.preventDefault) e.preventDefault();
      Backbone.history.navigate('tasks/' + this.model.attributes.id, { trigger: true });
    },

    render: function () {
      var compiledTemplate;

      this.data = {
        data: this.model.toJSON(),
        tagTypes: this.options.tagTypes,
        tags: this.options.tags,
        madlibTags: this.options.madlibTags
      };
      console.log(this.data);

      compiledTemplate = _.template(TaskEditFormTemplate, this.data);
      this.$el.html(compiledTemplate);

      // DOM now exists, begin select2 init
      this.initializeSelect2();
    },

    initializeSelect2: function () {

      var formatResult = function (object, container, query) {
        return object.name;
      };

      // $("#skills-required").select2({
      //   formatResult: formatResult,
      //   formatSelection: formatResult,
      //   minimumInputLength: 1,
      //   ajax: {
      //     url: '/api/ac/tag',
      //     dataType: 'json',
      //     data: function (term) {
      //       return {
      //         type: 'skillRequired',
      //         q: term
      //       };
      //     },
      //     results: function (data) {
      //       return { results: data };
      //     }
      //   }
      // });

      // $("#time-required").select2({
      //   formatResult: formatResult,
      //   formatSelection: formatResult,
      //   minimumInputLength: 1,
      //   ajax: {
      //     url: '/api/ac/tag',
      //     dataType: 'json',
      //     data: function (term) {
      //       return {
      //         type: 'time-required',
      //         q: term
      //       };
      //     },
      //     results: function (data) {
      //       return { results: data };
      //     }
      //   }
      // });

      // $("#time-estimate").select2({
      //   formatResult: formatResult,
      //   formatSelection: formatResult,
      //   minimumInputLength: 1,
      //   ajax: {
      //     url: '/api/ac/tag',
      //     dataType: 'json',
      //     data: function (term) {
      //       return {
      //         type: 'time-estimate',
      //         q: term
      //       };
      //     },
      //     results: function (data) {
      //       return { results: data };
      //     }
      //   }
      // });

      // $("#length").select2({
      //   formatResult: formatResult,
      //   formatSelection: formatResult,
      //   minimumInputLength: 1,
      //   ajax: {
      //     url: '/api/ac/tag',
      //     dataType: 'json',
      //     data: function (term) {
      //       return {
      //         type: 'length',
      //         q: term
      //       };
      //     },
      //     results: function (data) {
      //       return { results: data };
      //     }
      //   }
      // });

      $("#topics").select2({
        placeholder: "topics",
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
      if (this.data['madlibTags'].topic) {
        $("#topics").select2('data', this.data['madlibTags'].topic);
      }

      // $("#people").select2({
      //   formatResult: formatResult,
      //   formatSelection: formatResult,
      //   minimumInputLength: 1,
      //   ajax: {
      //     url: '/api/ac/tag',
      //     dataType: 'json',
      //     data: function (term) {
      //       return {
      //         type: 'people',
      //         q: term
      //       };
      //     },
      //     results: function (data) {
      //       return { results: data };
      //     }
      //   }
      // });

      $("#skills").select2({
        placeholder: "skills",
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
      if (this.data['madlibTags'].skill) {
        $("#skills").select2('data', this.data['madlibTags'].skill);
      }

      $("#location").select2({
        formatResult: formatResult,
        formatSelection: formatResult,
        minimumInputLength: 1,
        data: [ location ],
        ajax: {
          url: '/api/ac/tag',
          dataType: 'json',
          data: function (term) {
            return {
              type: 'location',
              q: term
            };
          },
          results: function (data) {
            return { results: data };
          }
        }
      });

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
        placeholder: 'location',
        width: '130px'
      });

      // $("#skills").select2({
      //   formatResult: formatResult,
      //   formatSelection: formatResult,
      //   minimumInputLength: 1,
      //   ajax: {
      //     url: '/api/ac/tag',
      //     dataType: 'json',
      //     data: function (term) {
      //       return {
      //         type: 'skill',
      //         q: term
      //       };
      //     },
      //     results: function (data) {
      //       return { results: data };
      //     }
      //   }
      // });

    },

    submit: function (e) {
      if (e.preventDefault) e.preventDefault();

      var tags = [
        $("#topics").select2('data'),
        $("#skills").select2('data'),
        $("#skills-required").select2('data'),
        $("#people").select2('data'),
        $("#time-required").select2('data'),
        $("#length").select2('data'),
        // $("#time-estimate").select2('data'),
        // $("#task-location").select2('data'),
        $("#input-specific-location").val(),
      ];

      var self = this,
          types = ["skillsRequired", "timeRequired", "people", "length", "timeEstimates"];

      this.tagSources = {};

      var requestAllTagsByType = function (type) {
        $.ajax({
          url: '/api/ac/tag?type=' + type + '&list',
          type: 'GET',
          async: false,
          success: function (data) {
            // Dynamically create an associative
            // array based on that for the pointer to the list itself to be iterated through
            // on the front-end.
              self.tagSources[type] = data;
          }
        });
      }

      async.each(types, requestAllTagsByType, function (err) {
        self.render();
      });

      var data = {
        title: $("#task-edit-form-title").val(),
        description: $("#task-edit-form-description").val()
      }

      this.model.trigger("task:model:update", data);
    },

    initTaskTags: function (tags) {
      var self = this,
          tagMap;

      var removeTag = function (type, done) {
        if (self.model[type]) {

          if (self.model[type].tagId) {
            return done();
          }

          $.ajax({
            url: '/api/tag/' + self.model[type].tagId,
            type: 'DELETE',
            success: function (data) {
              return done();
            }
          });

          return;
        } return done();
      };

      var addTag = function (tag, done) {
        if (!tag || !tag.id) {
          return done();
        }

        tagMap = {
          tagId: tag.id,
          taskId: this.model.id
        }

        $.ajax({
          url: '/api/tag',
          type: 'POST',
          data: tagMap
        }).done(function (data) {
          done();
        });
      }

      async.each(tags, addTag, function (err) {
        return self.model.trigger("task:tags:save:success", err);
      });

      this.listenTo(self.model, "task:tags:save:success", function (data) {
        Backbone.history.navigate('taskShow', { trigger: true })
      });
    }

  });

  return TaskEditFormView;
})
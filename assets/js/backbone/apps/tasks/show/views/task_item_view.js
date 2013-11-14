define([
  'bootstrap',
  'popovers',
  'underscore',
  'backbone',
  'async',
  'base_view',
  'text!task_show_template'
], function (Bootstrap, Popovers, _, Backbone, async, BaseView, TaskShowTemplate) {

  var TaskItemView = BaseView.extend({

    // Empty container for task show page
    // Aka item view.
    el: "#container",

    initialize: function (options) {
      var self = this;
      this.model.trigger("task:model:fetch", this.options.id);
      this.listenTo(this.model, "task:model:fetch:success", function (model) {
        self.model = model;
        self.render();
      });
    },

    render: function () {
      var self = this;

      this.initializeSelect2Data();


      $.ajax({
        url: '/api/tag/findAllByTaskId/' + self.options.id,
        async: false,
        success: function (tagData) {
          var data = {};
          self.model.attributes['tags'] = tagData;

          _.each(self.model.toJSON().tags, function (tag) {
            if (tag.tag.type === 'people') {
              data['people'] = tag.tag;
            } else if (tag.tag.type === 'length') {
              data['length'] = tag.tag;
            } else if (tag.tag.type === 'skills-required') {
              data['skillsRequired'] = tag.tag;
            } else if (tag.tag.type === 'time-required') {
              data['timeRequired'] = tag.tag;
            }
          });

          data['model'] = self.model.toJSON();

          var compiledTemplate = _.template(TaskShowTemplate, data);
          $(self.el).html(compiledTemplate)

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
          self.initTaskTags(tags);
        }
      });
    },

    initializeSelect2Data: function () {
      var self = this,
          types = ["skills-required", "time-required", "people", "length", "time-estimates"];

      this.tagSources = {};

      var requestAllTagsByType = function (type) {
        $.ajax({
          url: '/api/ac/tag?type=' + type + '&list',
          type: 'GET',
          async: false,
          success: function (data) {
            // Dynamically take the hyphen delimited type (if more than 1 word) and
            // camelize it like the template expects.  Then create an associative
            // array based on that for the pointer to the list itself to be iterated through
            // on the front-end.
            var typeArray = type.split("-");
            if (typeArray.length > 1) {
              typeArray[typeArray.length - 1] = typeArray[typeArray.length - 1].charAt(0).toUpperCase() + typeArray[typeArray.length - 1].substr(1).toLowerCase();
              self.tagSources[typeArray.join("")] = data;
            } else {
              self.tagSources[type] = data;
            }
          }
        });
      }

      async.each(types, requestAllTagsByType, function (err) {
        self.render();
      });
    },

    initializeTags: function () {
      this.tagsView = new TagShowView({
        model: this.model,
        el: '.project-tags-wrapper',
        target: 'task',
        url: '/api/tag/findAllByTaskId'
      });
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
        }
        return done
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

    },

    cleanup: function () {
      $(this.el).children().remove();
    }

  });

  return TaskItemView;
})
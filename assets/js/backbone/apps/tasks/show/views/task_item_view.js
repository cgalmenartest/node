define([
  'bootstrap',
  'popovers',
  'underscore',
  'backbone',
  'async',
  'base_view',
  'tag_config',
  'text!task_show_template'
], function (Bootstrap, Popovers, _, Backbone, async, BaseView, TagConfig, TaskShowTemplate) {

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

          var tags = [];
          var validTags = {};

          // Attempting a push into a fresh array to fix a bug I'm seeing
          _.each(self.model.toJSON().tags(), function (tag) {
            tags.push(tag.tag);
          }

          // Attempting to build up an obj that stores the tags
          // and the config data so that I can have access to both
          // on the front-end layer after validating the server did indeed
          // return the propper tag types for this entity (task).
          for (var i in TagConfig.tags) {
            for (var j = 0; j < tags.length; j += 1) {
              if (TagConfig.tags[i].type === tags[j].type) {
                validTags[tags[j].type + "_config"] = TagConfig.tags[i];
                validTags[TagConfig.tags[i].type] = tags[j];
              }
            }
          }

          // I can't depend on a key to be the same, so push it into an array
          var keys = _.keys(validTags)

          // At this point we can confirm it is a valid type
          // Add the type to the data object to be retrieved in the view
          for (var k in vaidTags) {
            for (var l in keys) {
              data[keys[l]] = validTags[k];
            }
          }

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
          types = ["skillsRequired", "timeRequired", "people", "length", "timeEstimates"];

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
              self.tagSources[type] = data;
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
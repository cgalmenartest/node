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

      this.tags = [];

      for (var i = 0; i < TagConfig['task'].length; i += 1) {
        this.tags.push(TagConfig.tags[TagConfig['task'][i]]);
      }

      this.formatTags();
    },

    formatTags: function () {
      var i         = 0,
          self      = this,
          tagIcon   = {},
          tagClass  = {};

      for ( ; i < this.tags.length; i += 1) {
        tagIcon[this.tags[i].type] = this.tags[i].icon;
        tagClass[this.tags[i].type] = this.tags[i]['class'];
      }

      var renderTag = function (tag) {
        var templData = {
          model: self.model.toJSON(),
          tags: self.tags,
          tag: tag,
          edit: self.edit
        }
        var compiledTemplate = _.template(TaskShowTemplate, templData);
        var tagDom = $("#container")
        tagDom.html(compiledTemplate);
        $("#" + tagClass[tag.tag.type] + '-empty').hide();
      };

      $.ajax({
        url: '/api/tag/findAllByTaskId/' + self.options.id,
        async: false,
        success: function (data) {
          for (var i = 0; i < data.length; i += 1) {
            renderTag(data[i])
          }
        }
      })
    },

    // render: function () {
    //   var self = this;

    //   this.initializeSelect2Data();

    //   $.ajax({
    //     url: '/api/tag/findAllByTaskId/' + self.options.id,
    //     async: false,
    //     success: function (tagData) {
    //       var data = {};
    //       self.model.attributes['tags'] = tagData;

    //       var tags = [];
    //       var validTags = {};


    //       data['model'] = self.model.toJSON();

    //       var compiledTemplate = _.template(TaskShowTemplate, data);
    //       $(self.el).html(compiledTemplate)

    //       var tags = [
    //         $("#topics").select2('data'),
    //         $("#skills").select2('data'),
    //         $("#skills-required").select2('data'),
    //         $("#people").select2('data'),
    //         $("#time-required").select2('data'),
    //         $("#length").select2('data'),
    //         // $("#time-estimate").select2('data'),
    //         // $("#task-location").select2('data'),
    //         $("#input-specific-location").val(),
    //       ];
    //       self.initTaskTags(tags);
    //     }
    //   });
    // },

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
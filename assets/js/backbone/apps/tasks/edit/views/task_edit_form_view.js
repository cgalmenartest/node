define([
  'jquery',
  'underscore',
  'backbone',
  'text!task_edit_form_template'
], function ($, _, Backbone, TaskEditFormTemplate) {

  var TaskEditFormView = Backbone.View.extend({

    events: {
      'submit #task-edit-form': 'edit'
    },

    el: ".main-section",

    render: function () {
      var self = this,
          data = {
            data: self.model
          },
          compiledTemplate;

      compiledTemplate = _.template(TaskEditFormTemplate, data);
      this.$el.html(compiledTemplate);
    },

    edit: function (e) {
      if (e.preventDefault) e.preventDefault();

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
define([
  'jquery',
  'underscore',
  'backbone',
  'async',
  'utilities',
  'marked',
  'markdown_editor',
  'text!task_edit_form_template'
], function ($, _, Backbone, async, utilities, marked, MarkdownEditor, TaskEditFormTemplate) {

  var TaskEditFormView = Backbone.View.extend({

    events: {
      'blur .validate'        : 'v',
      'click #task-view'      : 'view',
      'submit #task-edit-form': 'submit'
    },

    initialize: function (options) {
      this.options = options;

      // Register listener to task update, the last step of saving
      this.listenTo(this.options.model, "task:update:success", function (data) {
        Backbone.history.navigate('tasks/' + data.attributes.id, { trigger: true });
      });
    },

    view: function (e) {
      if (e.preventDefault) e.preventDefault();
      Backbone.history.navigate('tasks/' + this.model.attributes.id, { trigger: true });
    },

    v: function (e) {
      return validate(e);
    },

    render: function () {
      var compiledTemplate;

      this.data = {
        data: this.model.toJSON(),
        tagTypes: this.options.tagTypes,
        tags: this.options.tags,
        madlibTags: this.options.madlibTags
      };

      compiledTemplate = _.template(TaskEditFormTemplate, this.data);
      this.$el.html(compiledTemplate);

      // DOM now exists, begin select2 init
      this.initializeSelect2();
      this.initializeTextArea();
    },

    initializeSelect2: function () {

      var formatResult = function (object, container, query) {
        var formatted = '<div class="select2-result-title">';
        formatted += object.name || object.title;
        formatted += '</div>';
        if (!_.isUndefined(object.description)) {
          formatted += '<div class="select2-result-description">' + marked(object.description) + '</div>';
        }
        return formatted;
      };

      this.$("#projectId").select2({
        placeholder: "Select a project to associate",
        multiple: false,
        formatResult: formatResult,
        formatSelection: formatResult,
        allowClear: true,
        ajax: {
          url: '/api/ac/project',
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
      if (this.data.data.project) {
        this.$("#projectId").select2('data', this.data.data.project);
      }

      this.$("#topics").select2({
        placeholder: "Start typing to select a topic.",
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
        this.$("#topics").select2('data', this.data['madlibTags'].topic);
      }

      this.$("#skills").select2({
        placeholder: "Start typing to select a skill.",
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
        this.$("#skills").select2('data', this.data['madlibTags'].skill);
      }

      // Topics select 2
      this.$("#location").select2({
        placeholder: "Start typing to select a location.",
        multiple: true,
        formatResult: formatResult,
        formatSelection: formatResult,
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
            return { results: data }
          }
        }
      });
      if (this.data['madlibTags'].location) {
        this.$("#location").select2('data', this.data['madlibTags'].location);
      }

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

    },

    initializeTextArea: function () {
      if (this.md) { this.md.cleanup(); }
      this.md = new MarkdownEditor({
        data: this.model.toJSON().description,
        el: ".markdown-edit",
        id: 'task-description',
        placeholder: 'Description of opportunity including goals, expected outcomes and deliverables.',
        rows: 6,
        maxlength: 1000,
        validation: ['empty', 'count1000']
      }).render();
    },

    submit: function (e) {
      if (e.preventDefault) e.preventDefault();
      var self = this;

      // check all of the field validation before submitting
      var children = this.$el.find('.validate');
      var abort = false;
      _.each(children, function (child) {
        var iAbort = validate({ currentTarget: child });
        abort = abort || iAbort;
      });
      if (abort === true) {
        return;
      }

      var types = ["task-skills-required", "task-time-required", "task-people", "task-length", "task-time-estimate", "skill", "topic", "location"];

      // Gather tags for submission after the task is created
      tags = {
        topic: this.$("#topics").select2('data'),
        skill: this.$("#skills").select2('data'),
        location: this.$("#location").select2('data'),
        'task-skills-required': [ this.$("#skills-required").select2('data') ],
        'task-people': [ this.$("#people").select2('data') ],
        'task-time-required': [ this.$("#time-required").select2('data') ],
        'task-time-estimate': [ this.$("#time-estimate").select2('data') ],
        'task-length': [ this.$("#length").select2('data') ]
      };

      var createDiff = function (oldTags, newTags) {
        var out = {
          remove: [],
          add: [],
          none: []
        };

        // find if a new tag selected already exists
        // if it does, remove it from the array
        // if it doesn't, add to the new list
        var findTag = function (tag, oldTags) {
          if(!tag) return;
          var none = null;
          for (var j in oldTags) {
            // if the tag is in both lists, do nothing
            if (oldTags[j].tagId == parseInt(tag.id)) {
              out.none.push(oldTags.id);
              none = j;
              break;
            }
          }
          // if in both lists, splice out of the old list
          if (none) {
            oldTags.splice(none, 1);
          } else {
            // the new tag was not found, so we have to add it
            out.add.push(parseInt(tag.id));
          }
        };

        var findDel = function (oldTags, type) {
          for (var j in oldTags) {
            // anything left of this type should be deleted
            if (oldTags[j].type == type) {
              out.remove.push(oldTags[j].id);
            }
          }
        };

        for (var t in types) {
          // check if
          _.each(newTags[types[t]], function (newTag) {
            findTag(newTag, oldTags);
          });
          // if there's any tags left in oldTags, they need to be deleted
          findDel(oldTags, types[t]);
        }
        return out;
      }

      var removeTag = function (id, done) {
        $.ajax({
          url: '/api/tag/' + id,
          type: 'DELETE',
          success: function (data) {
            return done();
          }
        });
      };

      var addTag = function (id, done) {
        var tagMap = {
          tagId: id,
          taskId: self.model.id
        };

        $.ajax({
          url: '/api/tag',
          type: 'POST',
          data: tagMap
        }).done(function (data) {
          done();
        });
      };

      var oldTags = [];
      for (var i in this.options.tags) {
        oldTags.push({
          id: parseInt(this.options.tags[i].id),
          tagId: parseInt(this.options.tags[i].tag.id),
          type: this.options.tags[i].tag.type
        });
      }

      var diff = createDiff(oldTags, tags);

      var modelData = {
        title: this.$("#task-title").val(),
        description: this.$("#task-description").val()
      };

      var projectId = this.$("#projectId").select2('data');
      if (projectId) {
        modelData.projectId = projectId.id;
      }

      // Add new tags
      async.each(diff.add, addTag, function (err) {
        // Delete old tags
        async.each(diff.remove, removeTag, function (err) {
          // Update model metadata
          self.options.model.trigger("task:update", modelData);
        });
      });
    },

    cleanup: function () {
      if (this.md) { this.md.cleanup(); }
      removeView(this);
    }

  });

  return TaskEditFormView;
})
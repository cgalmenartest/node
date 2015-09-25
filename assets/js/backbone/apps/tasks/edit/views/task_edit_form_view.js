var _ = require('underscore');
var Backbone = require('backbone');
var utilities = require('../../../../mixins/utilities');
var UIConfig = require('../../../../config/ui.json');
var async = require('async');
var marked = require('marked');
var MarkdownEditor = require('../../../../components/markdown_editor');
var TaskEditFormTemplate = require('../templates/task_edit_form_template.html');
var TagFactory = require('../../../../components/tag_factory');


var TaskEditFormView = Backbone.View.extend({

  events: {
    'blur .validate'         : 'v',
    'click #change-owner'    : 'displayChangeOwner',
    'click #task-view'       : 'view',
    'submit #task-edit-form' : 'submit'
  },

  initialize: function (options) {
    _.extend(this, Backbone.Events);

    this.options = options;
    this.tagFactory = new TagFactory();
    this.data = {};
    this.data.newTag = {};
    this.initializeListeners();
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
      newTags: [],
      newItemTags: [],
      tags: this.options.tags,
      madlibTags: this.options.madlibTags,
      ui: UIConfig
    };

    compiledTemplate = _.template(TaskEditFormTemplate)(this.data);
    this.$el.html(compiledTemplate);
    this.$el.i18n();

    // DOM now exists, begin select2 init
    this.initializeSelect2();
    this.initializeTextArea();

    // Set up time pickers
    $('#publishedAt').datetimepicker({
      defaultDate: this.data.data.publishedAt
    });

    if (this.data.data.assignedAt) {
      $('#assignedAt').datetimepicker({
        defaultDate: this.data.data.assignedAt
      });
    }

    if (this.data.data.completedAt) {
      $('#completedAt').datetimepicker({
        defaultDate: this.data.data.completedAt
      });
    }

  },

  initializeSelect2: function () {

    var formatResult = function (object, container, query) {
      var formatted = '<div class="select2-result-title">';
      formatted += _.escape(object.name || object.title);
      formatted += '</div>';
      if (!_.isUndefined(object.description)) {
        formatted += '<div class="select2-result-description">' + marked(object.description) + '</div>';
      }
      return formatted;
    };

    this.$("#owner").select2({
      placeholder: "task owner",
      multiple: false,
      formatResult: formatResult,
      formatSelection: formatResult,
      allowClear: false,
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
    if (this.data.data.owner) {
      this.$("#owner").select2('data', this.data.data.owner);
    }

    this.tagFactory.createTagDropDown({
      type: "skill",
      selector: "#task_tag_skills",
      width: "100%",
      tokenSeparators: [","],
      data: this.data['madlibTags'].skill
    });

    this.tagFactory.createTagDropDown({
      type: "location",
      selector: "#task_tag_location",
      width: "40%",
      data: this.data['madlibTags'].location
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

  },

  initializeTextArea: function () {
    if (this.md) { this.md.cleanup(); }
    this.md = new MarkdownEditor({
      data: this.model.toJSON().description,
      el: ".markdown-edit",
      id: 'task-description',
      placeholder: 'Description of opportunity including goals, expected outcomes and deliverables.',
      title: 'Opportunity Description',
      rows: 6,
      validate: ['empty']
    }).render();
  },

  initializeListeners: function() {
    var self = this;

    self.on("task:tags:save:done", function (){
      var owner       = this.$("#owner").select2('data'),
          completedBy = this.$('#estimated-completion-date').val();

      var modelData = {
        title: this.$("#task-title").val(),
        description: this.$("#task-description").val(),
        publishedAt: this.$("#publishedAt").val() || undefined,
        assignedAt: this.$("#assignedAt").val() || undefined,
        completedAt: this.$("#completedAt").val() || undefined,
        projectId: null
      };

      if (owner) modelData['userId'] = owner.id;
      if (completedBy != '') modelData['completedBy'] = completedBy;

      var tags = _(this.getTagsFromPage()).chain()
            .map(function(tag) {
              if (!tag || !tag.id) return;
              return (tag.id && tag.id !== tag.name) ? +tag.id : {
                name: tag.name,
                type: tag.tagType,
                data: tag.data
              };
            })
            .compact()
            .value();

      modelData.tags = tags;

      self.options.model.trigger("task:update", modelData);
    });
  },

  submit: function (e) {
    var self = this;
    if (e.preventDefault) e.preventDefault();

    var tags = [];
    var oldTags = [];
    var diff = [];

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
    return self.trigger("task:tags:save:done");
  },

  displayChangeOwner: function (e) {
    e.preventDefault();
    this.$('.project-owner').hide();
    this.$('.change-project-owner').show();

    return this;
  },

  getTagsFromPage: function () {

    // Gather tags for submission after the task is created
    var tags = [],
        taskTimeTag = this.$("[name=task-time-required]:checked").val();

    if (taskTimeTag) {
        tags.push.apply(tags,[{
          id: parseInt(taskTimeTag),
          type: 'task-time-required'
        }]);
    }

    tags.push.apply(tags,this.$("#task_tag_skills").select2('data'));
    tags.push.apply(tags,this.$("#task_tag_location").select2('data'));
    tags.push.apply(tags,[this.$("#people").select2('data')]);
    tags.push.apply(tags,[this.$("#time-required").select2('data')]);
    tags.push.apply(tags,[this.$("#time-estimate").select2('data')]);
    tags.push.apply(tags,[this.$("#length").select2('data')]);

    return tags;
  },

  getOldTags: function () {

    var oldTags = [];
      for (var i in this.options.tags) {
        oldTags.push({
          id: parseInt(this.options.tags[i].id),
          tagId: parseInt(this.options.tags[i].tag.id),
          type: this.options.tags[i].tag.type
        });
      }

    return oldTags;
  },

  cleanup: function () {
    if (this.md) { this.md.cleanup(); }
    removeView(this);
  }

});

module.exports = TaskEditFormView;

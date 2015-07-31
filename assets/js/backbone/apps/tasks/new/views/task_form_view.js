var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var async = require('async');
var utilities = require('../../../../mixins/utilities');
var MarkdownEditor = require('../../../../components/markdown_editor');
var TasksCollection = require('../../../../entities/tasks/tasks_collection');
var TaskFormTemplate = require('../templates/task_form_template.html');
var TagFactory = require('../../../../components/tag_factory');

var TaskFormView = Backbone.View.extend({

  el: "#container",

  events: {
    "change .validate"        : "v",
    "change #task-location"   : "locationChange",
    "click #create-button"    : "submit"
  },

  initialize: function (options) {
    this.options = _.extend(options, this.defaults);
    this.tasks = this.options.tasks;
    this.tagFactory = new TagFactory();
    this.data = {};
    this.data.newTag = {};
    this.data.newItemTags = [];
    this.data.existingTags = [];
    this.initializeSelect2Data();
    this.initializeListeners();
  },

  initializeSelect2Data: function () {
    var self = this;
    var types = ["task-time-required", "task-length", "task-time-estimate", "task-skills-required"];

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
    };

    async.each(types, requestAllTagsByType, function (err) {
      self.render();
    });
  },

  initializeListeners: function() {
    var self = this;
    _.extend(this, Backbone.Events);
  },

  getTagsFromPage: function () {

    // Gather tags for submission after the task is created
    tags = {
      topic: this.$("#task_tag_topics").select2('data'),
      skill: this.$("#task_tagskills").select2('data'),
      location: this.$("#task_tag_location").select2('data'),
      'task-skills-required': [ this.$("#skills-required").select2('data') ],
      'task-people': [ this.$("#people").select2('data') ],
      'task-time-required': [ this.$("#time-required").select2('data') ],
      'task-time-estimate': [ this.$("#time-estimate").select2('data') ],
      'task-length': [ this.$("#length").select2('data') ]
    };

    return tags;
  },

  render: function () {
    var template = _.template(TaskFormTemplate)({ tags: this.tagSources });
    this.$el.html(template);
    this.initializeSelect2();
    this.initializeTextArea();

    this.$el.i18n();

    // Return this for chaining.
    return this;
  },

  v: function (e) {
    return validate(e);
  },

  initializeSelect2: function () {
    var self = this;

    self.tagFactory.createTagDropDown({type:"skill",selector:"#task_tag_skills",width: "100%",tokenSeparators: [","]});
    self.tagFactory.createTagDropDown({type:"location",selector:"#task_tag_location",tokenSeparators: [","]});

    // ------------------------------ //
    // PRE-DEFINED SELECT MENUS BELOW //
    // ------------------------------ //

    self.$("#time-required").select2({
      placeholder: 'Time Commitment',
      width: 'resolve'
    });

    self.$("#length").select2({
      placeholder: 'Deadline',
      width: 'resolve'
    });

    self.$("#time-estimate").select2({
      placeholder: 'Estimated Time Required',
      width: 'resolve'
    });

    self.$("#task-location").select2({
      placeholder: 'Work Location',
      width: 'resolve'
    });

  },

  initializeTextArea: function () {
    if (this.md) { this.md.cleanup(); }
    this.md = new MarkdownEditor({
      data: '',
      el: ".markdown-edit",
      id: 'task-description',
      placeholder: 'Description of ' + i18n.t('task') + ' including goals, expected outcomes and deliverables.',
      title: i18n.t('Task') + ' Description',
      rows: 6,
      validate: ['empty']
    }).render();
  },

  locationChange: function (e) {
    if (_.isEqual(e.currentTarget.value, "true")) {
      this.$(".el-specific-location").show();
    } else {
      this.$(".el-specific-location").hide();
    }
  },

  validateBeforeSubmit: function (fields) {
    var self  = this,
        valid = true;
    fields.forEach(function (field) {
      // remember: this.v() return true if there IS a validation error
      // it returns false if there is not
      var i = self.v({ currentTarget: field });
      console.log(field, i);
      i === true ? valid = false : valid = true;
    });

    return valid;
  },

  submit: function (e) {
    var fieldsToValidate  = ['#task-title', '#task-description', '#task-responsibilities'],
        validForm         = this.validateBeforeSubmit(fieldsToValidate),
        data;

    if (!validForm) return this;

    function getTags() {
      var tags = [];
      tags.push.apply(tags,this.$("#task_tag_skills").select2('data'));
      tags.push.apply(tags,this.$("#task_tag_location").select2('data'));
      tags.push.apply(tags,[this.$("[name=task-time-required]:checked").val()]);
      tags.push.apply(tags,[this.$("#time-estimate").select2('data')]);
      tags.push.apply(tags,[this.$("#length").select2('data')]);
      return _(tags).map(function(tag) {
        console.log('tag', tag);
        return (tag.id && tag.id !== tag.name) ? +tag.id : {
          name: tag.name,
          type: tag.tagType,
          data: tag.data
        };
      });
      return tags;
    }

    data = {
      'title'      : this.$('#task-title').val(),
      'description': this.$('#task-description').val(),
      'tags'       : getTags()
    };

    console.log('submitting with', data);
    this.collection.addAndSave(data);

    return this;
  },

  cleanup: function () {
    if (this.md) { this.md.cleanup(); }
    removeView(this);
  }

});

module.exports = TaskFormView;

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

  el: '#container',

  events: {
    'change .validate'                :  'v',
    'click [name=task-time-required]' :  'toggleTimeOptions',
    'change #task-location'           :  'locationChange',
    'click #js-draft-create'          :  'saveDraft',
    'click #create-button'            :  'submit',
  },

  /*
   * Initialize the Task Creation Form ViewController.
   */
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

 /*
  * Initialize the Select2Data custom select components.
  */
  initializeSelect2Data: function () {
    var self = this;
    var types = [
      'task-time-required',
      'task-length',
      'task-time-estimate',
      'task-skills-required',
      'task-people',
    ];

    this.tagSources = {};

    var requestAllTagsByType = function (type) {
      $.ajax({
        url: '/api/ac/tag?type=' + type + '&list',
        type: 'GET',
        async: false,
        success: function (data) {
          if (!window.cache.currentUser) {
            window.location = '/';
            return;
          }
          var userAgency = _.where(window.cache.currentUser.tags, { type: 'agency' })[0];
          if (type === 'task-time-estimate' || type === 'task-length') {
            data = _.sortBy(data, 'updatedAt');
          }
          else if (type === 'task-time-required') {
            data = _.chain(data).filter(function(item) {
              // if an agency is included in the data of a tag
              // then restrict it to users who are also
              // in that agency
              var agencyId = false;
              if (item.data && item.data.agency) agencyId = item.data.agency.id;
              if ((!agencyId) || (userAgency && agencyId === userAgency.id)) return true;
              return false;
            }).map(function (item) {
              if (item.name == 'One time') {
                item.description = 'A one time task with a defined timeline'
              }
              else if (item.name == 'Ongoing') {
                item.description = 'Requires a portion of participant’s time until a goal is reached'
              }
              return item;
            }).value();
          }
          self.tagSources[type] = data;
        }
      });
    };

    async.each(types, requestAllTagsByType, function (err) {
      self.render();
    });
  },

  /*
   * Initialize the event listeners for this ViewController.
   */
  initializeListeners: function () {

    var self = this;

    _.extend(this, Backbone.Events);

    this.listenTo( this, 'task:save:draft', function () {

      self.renderStateModal();

    } );

  },

  /*
   * Render the View
   */
  render: function () {

    // Template data
    //
    var data = {

      tags: this.tagSources,
      draft: {
        title: '',
        description: '',
      },

    };

    // If there are any models in the collection, populate the draft within
    // the collection into data for the template.
    //
    if ( this.collection.length ) {

      data.draft = this.collection.first().attributes;

    }

    var template = _.template( TaskFormTemplate )( data );

    this.$el.html( template );
    this.initializeSelect2();
    this.initializeTextArea( { data: data.draft.description } );

    this.$( '#time-options' ).css( 'display', 'none' );

    this.$el.i18n();

    // Return this for chaining.
    return this;

  },

  /*
   * Render modal for the Task Creation Form ViewController
   */
  renderStateModal: function () {

    // Grab the section of the DOM that is going to be updated.
    // Build up an object to display data
    // Render this template
    // Maybe make this a child view?
    //
    console.log( 'renderStateModal' );
    alert( 'renderStateModal' );

  },

  /*
   * Validation event handler
   */
  v: function (e) {
    return validate(e);
  },

  /*
   * Initialize Select2Data again?
   */
  initializeSelect2: function () {
    var self = this;

    self.tagFactory.createTagDropDown( {
      type:'skill',
      selector:'#js-task-tag',
      width: '100%',
      tokenSeparators: [','],
      placeholder:'Start typing to select a tag',
    } );
    self.tagFactory.createTagDropDown( {
      type:'location',
      selector:'#js-task-location',
      tokenSeparators: [','],
    } );

    // ------------------------------ //
    // PRE-DEFINED SELECT MENUS BELOW //
    // ------------------------------ //

    self.$('#time-required').select2({
      placeholder: 'Time Commitment',
      width: 'resolve',
    });

    self.$('#task-length').select2({
      placeholder: 'Frequency of work',
      width: 'fullwidth',
    });

    self.$('#js-task-time-estimate').select2({
      placeholder: 'Estimated Time Required',
      width: 'resolve',
    });

    self.$('#task-location').select2({
      placeholder: 'Work Location',
      width: 'resolve',
    });

    self.$('#js-participant-selection').select2({
      placeholder: 'People required',
      width: 'resolve',
    });

  },

  /*
   * Initialize Markdown Editor Text Area
   */
  initializeTextArea: function ( options ) {

    var defaults = _.extend( {
      data: '',
      el: '.markdown-edit',
      id: 'task-description',
      title: i18n.t('Task') + ' Description',
      rows: 6,
      validate: ['empty'],
    }, options );

    if ( this.md ) { this.md.cleanup(); }

    this.md = new MarkdownEditor( defaults ).render();

  },

  /*
   * Setup Time Options toggling
   */
  toggleTimeOptions: function (e) {
    var currentValue     = this.$('[name=task-time-required]:checked').val(),
      timeOptionsParent  = this.$('#time-options'),
      timeRequired       = this.$('#time-options-time-required'),
      timeRequiredAside  = this.$('#time-options-time-required aside'),
      completionDate     = this.$('#time-options-completion-date'),
      timeFrequency      = this.$('#time-options-time-frequency');

    timeOptionsParent.css('display', 'block');
    if (currentValue == 1) { // time selection is "One time"
      timeRequired.show();
      completionDate.show();
      timeRequiredAside.hide();
      timeFrequency.hide();
    }
    else if (currentValue == 2) { // time selection is "On going"
      timeRequired.show();
      timeRequiredAside.show();
      timeFrequency.show();
      completionDate.hide();
    }
    else {
      timeRequired.hide();
      timeRequiredAside.hide();
      timeFrequency.hide();
      completionDate.hide();
    }
  },

  locationChange: function (e) {
    if (_.isEqual(e.currentTarget.value, 'true')) {
      this.$('.el-specific-location').show();
    } else {
      this.$('.el-specific-location').hide();
    }
  },

  validateBeforeSubmit: function (fields) {
    var self  = this,
      field, validation;

    for (var i=0; i<fields.length; i++) {
      // remember: this.v() return true if there IS a validation error
      // it returns false if there is not
      field = fields[i];
      valid = self.v({ currentTarget: field });

      if (valid === true) {
        return false;
      }
    }

    return true;
  },

  /*
   * Parse the fields in the form for saving a task.
   * @param { Object } e jQuery event object
   * @return { Object } data An object of the fields parsed from the form
   */
  parseFields: function ( event ) {

    debugger;
    var getData = _.property( 'dataset' );
    var getTarget = _.property( 'target' );
    var DS = getData( getTarget( event ) );
    var isDraft = ( 'draft' === DS.state );

    if ( this.collection.length ) {

      alert( 'we have an item in the collection' );
      debugger;

    }

    var data = {
      'title': this.$( '#task-title' ).val(),
      'description': this.$( '#task-description' ).val(),
      'projectId': null,
      'tags': this.getTags(),
      'state': 'draft',
    };

    console.log( data );

    return data;
  },

  /*
   * Save a draft
   * This method sends the data to the server and saves the task.
   * @param { Object } e jQuery event object
   */
  saveDraft: function (e) {

    var draft = true;

    var data = this.parseFields( event );

    this.collection.trigger( 'task:draft', data );

  },

  /*
   * Submit event handler.
   * This method sends the data to the server and saves the task
   * @param { Object } e jQuery event object
   * @param { Boolean } draft
   * @return { TaskFormView } this
   */
  submit: function (e, draft) {
    var fieldsToValidate  = [
      '#task-title',
      '#task-description',
      '[name=task-time-required]:checked',
      '[name=time-required]:checked',
    ];
    var validForm = this.validateBeforeSubmit(fieldsToValidate);
    var completedBy = this.$('#estimated-completion-date').val();
    var data;

    if (!validForm && !draft) return this;

    data = {
      'title'      : this.$('#task-title').val(),
      'description': this.$('#task-description').val(),
      'projectId'  : null,
      'tags'       : this.getTags(),
    };

    if (draft) data['state'] = this.$('#js-draft-create').data('state');
    if (completedBy != '') data['completedBy'] = completedBy;

    this.collection.trigger('task:save', data);

    return this;
  },

  /*
   * Get tags from the "New Task" form. This method will sanatize and serialize
   * the data related to tags in the new task form. If there is no data in the tag
   * fields it must be removed otherwise the server will respond with a 500 error
   * when attempting to parse non-existant tags in the Waterline ORM.
   * @return { Array } A collection of tags mapped to an array
   *
   */
  getTags: function getTags () {

    var tags        = [];
    var effortType  = this.$( '[name=task-time-required]:checked' ).val();
    var tagSkills   = this.$( '#js-task-tag' ).select2( 'data' );
    var tagLocation = this.$( '#js-task-location' ).select2( 'data' );
    var peopleCount = this.$( '#js-participant-selection' ).select2( 'data' );

    // check for the presence of data in these fields
    // no data means no tags are supplied
    // don't send those tags because the API returns 500
    if ( tagSkills != [] ) tags.push.apply( tags, tagSkills );
    if ( tagLocation != [] ) tags.push.apply( tags, tagLocation );
    if ( peopleCount != [] ) tags.push( peopleCount );
    if ( effortType ) tags.push.apply( tags,[ { id: effortType } ] );

    // if time selection is NOT full-time, make sure to include
    // the other tags
    if ( effortType == 1 ) { // time selection is 'One time'
      tags.push.apply( tags,[ this. $( '#js-task-time-estimate' ).select2( 'data' ) ] );
    } else if ( effortType == 2 ) { // time selection is 'On going'
      tags.push.apply( tags,[ this. $( '#js-task-time-estimate' ).select2( 'data' ) ] );
      tags.push.apply( tags,[ this. $( '#js-time-frequency-estimate' ).select2( 'data' ) ] );
    }

    return _( tags ).map( function ( tag ) {
      return ( tag.id && tag.id !== tag.name && tag.id !== undefined ) ? +tag.id : {
        name: tag.name,
        type: tag.tagType,
        data: tag.data,
      };
    } );

  },

  /*
   * Clean up the review by removing it and child components from memory.
   */
  cleanup: function () {
    if (this.md) { this.md.cleanup(); }
    removeView(this);
  },

});

module.exports = TaskFormView;


var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var async = require('async');
var ModalComponent = require('../../../../components/modal');
var TagConfig = require('../../../../config/tag');
var TagTemplate = require('../templates/tag_item_template.html');
var TagShowTemplate = require('../templates/tag_show_template.html');
var TagFactory = require('../../../../components/tag_factory');


var TagShowView = Backbone.View.extend({

  events: {
    "click .tag-delete"     : "deleteTag"
  },

  initialize: function (options) {
    this.options = options;
    this.model = options.model;
    this.target = options.target;
    this.targetId = options.targetId;
    this.edit = options.edit;
    this.tagFactory = new TagFactory();
    this.tags = [];
    // Figure out which tags apply
    for (var i = 0; i < TagConfig[this.target].length; i++) {
      this.tags.push(TagConfig.tags[TagConfig[this.target][i]]);
    }
  },

  render: function () {
    var data = {
      data: this.model.toJSON(),
      tags: this.tags,
      edit: this.edit,
      user: window.cache.currentUser || {}
    };
    var template = _.template(TagShowTemplate)(data);
    this.$el.html(template);
    this.initializeSelect2();
    this.initializeTags();
    return this;
  },

  initializeSelect2: function () {
    var self = this;

    self.tagFactory.createTagDropDown({
      type:"skill",selector:"#tag_skill",width: "100%",tokenSeparators: [","]
    });

    self.tagFactory.createTagDropDown({
      type:"topic",selector:"#tag_topic",width: "100%",tokenSeparators: [","]
    });

    self.tagFactory.createTagDropDown({type:"location",selector:"#tag_location",width: "100%"});
    self.tagFactory.createTagDropDown({type:"agency",selector:"#tag_agency",width: "100%"});
    self.model.trigger("profile:input:changed");
  },

  initializeTags: function() {
    // Load tags for the view
    var self = this;

    var tagIcon = {};
    var tagClass = {};
    for (var i = 0; i < this.tags.length; i++) {
      tagIcon[this.tags[i].type] = this.tags[i].icon;
      tagClass[this.tags[i].type] = this.tags[i]['class'];
    }

    var renderTag = function (tag) {
      var templData = {
        data: self.model.toJSON(),
        tags: self.tags,
        tag: tag,
        edit: self.edit,
        user: window.cache.currentUser || {}
      };
      var compiledTemplate = _.template(TagTemplate)(templData);
      var tagDom = $("." + tag.type).children(".tags");
      tagDom.append(compiledTemplate);
      $('#' + tagClass[tag.type] + '-empty').hide();
    };

    _(this.model.get('tags')).each(renderTag);
    // Initialize Select2 for Administrative Functions
    var formatResult = function (object, container, query) {
      return '<i class="' + tagIcon[object.type] + '"></i> ' + object.name;
    };

    $("#input-tags").select2({
      placeholder: 'Add tags',
      multiple: true,
      formatResult: formatResult,
      formatSelection: formatResult,
      ajax: {
        url: '/api/ac/tag',
        dataType: 'json',
        data: function (term) {
          return {
            type: TagConfig[self.target].join(),
            q: term
          };
        },
        results: function (data) {
          return { results: data };
        }
      }
    });

    // New tags added in to the DB via the modal
    this.listenTo(this.model, this.target + ":tag:new", function (data) {
      // Destory modal
      $(".modal").modal('hide');
      // Add tag into the data list
      var s2data = $("#input-tags").select2("data");
      s2data.push(data);
      $("#input-tags").select2("data", s2data);
    });

    // Tags saved using the select2 dialog
    this.listenTo(this.model, this.target + ":tag:save", function (data) {
      for (var i = 0; i < data.length; i++) {
        if (!data[i].existing) {
          renderTag(data[i]);
        }
      }
      $("#input-tags").select2("val", "");
    });

    this.listenTo(this.model, this.target + ":tag:delete", function (e) {
      if ($(e.currentTarget).parent('li').siblings().length == 1) {
        $(e.currentTarget).parent('li').siblings('.tag-empty').show();
      }
      $(e.currentTarget).parent('li').remove();
    });
  },

  deleteTag: function (e) {
    if (e.preventDefault) e.preventDefault();
    var tags = _(this.model.get('tags')).filter(function(tag) {
          return tag.id !== $(e.currentTarget).data('id');
        });
    this.model.set('tags', tags);
    this.model.trigger(this.options.target + ":tag:delete", e);

  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = TagShowView;

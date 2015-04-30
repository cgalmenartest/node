
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var AdminTagTemplate = require('../templates/admin_tag_template.html');
var TagFactory = require('../../../components/tag_factory');

var AdminTagView = Backbone.View.extend({

  events: {
  },

  initialize: function (options) {
    this.options = options;
    this.tagFactory = new TagFactory();
  },

  render: function () {
    var types = [
      'agency',
      'skill',
      'topic'
    ];
    var data = {
      types: types
    };
    var template = _.template(AdminTagTemplate)(data);
    var self = this;
    this.$el.html(template);
    this.$el.show();

    _(types).forEach(this.tagSelector, this);

    Backbone.history.navigate('/admin/tag');
    return this;
  },

  tagSelector: function(type) {
    var self = this;
    $('#' + type).select2({
      placeholder: 'Search for a tag',
      minimumInputLength: 2,
      formatResult: function (obj, container, query) {
        return obj.name;
      },
      formatSelection: function (obj, container, query) {
        return obj.name;
      },
      createSearchChoice: function (term, values) {
        var vals = values.map(function(value) {
          return value.value.toLowerCase();
        });
        return (vals.indexOf(term.toLowerCase()) >=0) ? false : {
          unmatched: true,
          tagType: type,
          id: term,
          value: term,
          name: "<b>"+term+"</b> <i>click to create a new tag with this value</i>"
        };
      },
      ajax: {
        url: '/api/ac/tag',
        dataType: 'json',
        data: function (term) {
          return {
            type: type,
            q: term
          };
        },
        results: function (data) {
          return { results: data };
        }
      }
    }).on('change', function(e) {
      var $el = self.$(e.currentTarget);
      self.tagFactory.addTagEntities(e.added, self, function() {
        $('#' + type).select2('data', null);
        if (e.added && e.added.value === e.added.id) {
          $el.next('.form-status').text('Added tag: ' + e.added.value);
        } else {
          $el.next('.form-status').text('');
        }
      });
    });
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = AdminTagView;

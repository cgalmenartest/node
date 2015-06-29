/**
 * This component implements a tag widget, allowing creation lookup and deletion of tags from a common ui element
 *
 * Options:
 *
 */

var _ = require('underscore');
var Backbone = require('backbone');
var async = require('async');
var utils = require('../mixins/utilities');
var marked = require('marked');
var BaseComponent = require('../base/base_component');
var jqSelection = require('../../vendor/jquery.selection');


TagFactory = BaseComponent.extend({

	initialize: function (options) {
    this.options = options;

    return this;
  },

  addTagEntities: function (tag, context, done) {
  	//assumes
  	//  tag -- array of tag objects to add
  	//  tagType -- string specifying type for tagEntity table
    var self = this;

  	//this is current solution to mark a tag object as on the fly added
      if ( !tag || typeof tag.unmatched == 'undefined' || !tag.unmatched ){
        return done();
      }
    //remove the flag that marks them as new
    delete tag.unmatched;

    $.ajax({
      url: '/api/tagEntity',
      type: 'POST',
      data: {
        type: tag.tagType,
        name: tag.id,
        data: tag.data
      },
      success: function (data){
        if (context.data) {
          context.data.newTag = data;
          context.data.newItemTags.push(data);
        }
        return done(null, data);
      }
    });
  },

  /*
    @param {Object}   options
    @param {String}   options.type               - The tag type this dropdown will operate with
    @param {String}   options.selector           - CSS selector of the new dropdown, element should be preexisting
    @param {Boolean}  options.multiple           - Whether to allow multiple tags to be selected
    @param {*}        options.data               - The initial data loaded into the select2 element
    @param {String}   options.width='500px'      - CSS width attribute for the dropdown
    @param {String[]} options.tokenSeparators=[] - Array of valid tag delimeters
  */
  createTagDropDown: function(options) {

    //location tags get special treatment
    var isLocation = (options.type === 'location')

    //construct the settings for this tag type
    var settings = {

      placeholder:        "Start typing to select a " + options.type,
      minimumInputLength: (isLocation ? 1 : 2),
      multiple:           options.multiple || !isLocation,
      selectOnBlur:       !isLocation,
      width:              options.width || "500px",
      tokenSeparators:    options.tokenSeparators || [],

      formatResult: function (obj, container, query) {
        //allow the createSearchChoice to contain HTML
        return (obj.unmatched ? obj.name : _.escape(obj.name));
      },

      formatSelection: function (obj, container, query) {
        return (obj.unmatched ? obj.name : _.escape(obj.name));
      },

      createSearchChoice: function (term) {
        //unmatched = true is the flag for saving these "new" tags to tagEntity when the opp is saved
        return {
          unmatched: true,
          tagType: options.type,
          id: term,
          value: term,
          temp: true,
          name: "<b>"+_.escape(term)+"</b> <i>" + (isLocation ?
            "search for this location" :
            "click to create a new tag with this value") + "</i>"
        };
      },

      ajax: {
        url: '/api/ac/tag',
        dataType: 'json',
        data: function (term) {
          return {
            type: options.type,
            q: term
          };
        },
        results: function (data) {
          return { results: data };
        }
      }
    };


    //init Select2
    var $sel = self.$(options.selector).select2(settings);


    //event handlers
    $sel.on("select2-selecting", function (e) {
      if (e.choice.tagType === 'location') {




        var $el = self.$(e.currentTarget);
        var el = this;
        if (e.choice.temp) {
          this.temp = true;

          if(settings.multiple) {
            e.choice.name = '<em>Searching for <strong>' + e.choice.value + '</strong></em>';
          }
          else {
            $sel.select2('data', e.choice.name);
          }

          $.get('/api/location/suggest?q=' + e.choice.value, function(d) {
            d = _(d).map(function(item) {
              return {
                id: item.name,
                text: item.name,
                name: item.name,
                unmatched: true,
                tagType: 'location',
                data: _(item).omit('name')
              };
            });
            this.cache = $sel.select2('data');
            if(settings.multiple) {
              this.cache = _.reject(this.cache, function(item) {
                return (item.name.indexOf('<em>Searching for <strong>') >= 0);
              });
            }
            $sel.select2({
              data:               { results: d, text: 'name' },
              width:              settings.width,
              multiple:           settings.multiple,
              formatResult:       settings.formatResult,
              formatSelection:    settings.formatSelection,
              createSearchChoice: settings.createSearchChoice,
            }).select2('data', this.cache).select2('open');
            $sel.remote = false;
          });
        } else {
          this.reload = true;
          delete this.temp;
        }
      } else { //if this is NOT a location tag
        if ( e.choice.hasOwnProperty("unmatched") && e.choice.unmatched ){
          //remove the hint before adding it to the list
          e.choice.name = e.val;
        }
      }
    });

    $sel.on('select2-blur', function(e) {
      if (!this.reload && this.temp) {
        this.reload = true;
        delete this.temp;
      }
    });

    $sel.on('select2-open', function(e) {
      if (!this.reload && this.open) {
        delete this.open;
        delete this.temp;
        var cache = $("#location").select2('data');
        setTimeout(function() {
          $("#location").select2(settings)
            .select2('data', cache)
            .select2('open');
        }, 0);
      } else if (this.reload && this.open) {
        delete this.reload;
      }
    });

    //load initial data, if provided
    if(options.data) {
      $sel.select2('data', options.data);
    }
  },





  createLocationDropDown: function(options) {
    var self = this;

    var formatResult = function (object, container, query) {
      return object.name;
    };

    var modelJson = options.modelJson;

    var locationSettings = {
      placeholder: 'Select a Location',
      formatResult: formatResult,
      formatSelection: formatResult,
      minimumInputLength: 1,
      data: [ location ],
      createSearchChoice: function (term, values) {
        var vals = values.map(function(value) {
          return value.value.toLowerCase();
        });

        //unmatched = true is the flag for saving these "new" tags to tagEntity when the opp is saved
        return (vals.indexOf(term.toLowerCase()) >=0) ? false : {
          tagType: 'location',
          id: term,
          value: term,
          temp: true,
          name: "<b>"+term+"</b> <i>search for this location</i>"
        };
      },
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
          return { results: data };
        }
      }
    };

    $('#location').select2(locationSettings).on('select2-selecting', function(e) {
      var $el = self.$(e.currentTarget);
      var el = this;
      if (e.choice.temp) {
        this.temp = true;
        $('#location').select2('data', e.choice.name);
        $.get('/api/location/suggest?q=' + e.choice.value, function(d) {
          d = _(d).map(function(item) {
            return {
              id: item.name,
              text: item.name,
              name: item.name,
              unmatched: true,
              tagType: 'location',
              data: _(item).omit('name')
            };
          });
          el.reload = true;
          el.open = true;
          $('#location').select2({
            data: d,
            formatResult: function (obj) { return obj.name; },
            formatSelection: function (obj) { return obj.name; },
            createSearchChoice: function (term, values) {
              if (!values.some(function (v) {
                  return (v.name.toLowerCase().indexOf(term.toLowerCase()) >= 0);
                })) {
                return {
                  tagType: 'location',
                  id: term,
                  value: term,
                  temp: true,
                  name: "<b>" + term + "</b> <i>search for this location</i>"
                };
              }
            }
          }).select2('open');
        });
      } else {
        delete this.temp;
      }
    }).on('select2-open', function(e) {
      if (!this.reload && this.open) {
        delete this.open;
        delete this.temp;
        var cache = $("#location").select2('data');
        setTimeout(function() {
          $("#location").select2(locationSettings)
            .select2('data', cache)
            .select2('open');
        }, 0);
      } else if (this.reload && this.open) {
        delete this.reload;
      }
    });
    if (options.data) {
      $("#location").select2('data', options.data);
    }
  }

});

module.exports = TagFactory;

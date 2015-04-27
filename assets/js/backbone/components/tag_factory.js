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

  createTagDropDown: function(options) {
    var settings = {
          placeholder: "Start typing to select a "+options.type,
          minimumInputLength: 2,
          multiple: true,
          selectOnBlur: true,
          width: options.width || "500px",
          tokenSeparators: options.tokenSeparators || [],
          formatResult: function (obj, container, query) {
            return obj.name;
          },
          formatSelection: function (obj, container, query) {
            return obj.name;
          },
          createSearchChoice: function (term) {
            //unmatched = true is the flag for saving these "new" tags to tagEntity when the opp is saved
            return {
              unmatched: true,
              tagType: options.type,
              id: term,
              value: term,
              temp: true,
              name: "<b>"+term+"</b> <i>" + ((options.type !== 'location') ?
                "click to create a new tag with this value" :
                "search for this location") + "</i>"
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
        },
      $sel = self.$(options.selector);
    $sel.remote = true;
    $sel.select2(settings).on("select2-selecting", function (e) {
      if (e.choice.tagType === 'location') {
        var $el = self.$(e.currentTarget);
        if (e.choice.temp) {
          e.choice.name = '<em>Searching for <strong>' +
            e.choice.value + '</strong></em>';
          this.temp = true;
          $.get('/api/location/suggest?q=' + e.choice.value, function(d) {
            d = _(d).map(function(item) {
              return {
                id: item.name,
                name: item.name,
                unmatched: true,
                tagType: 'location',
                data: _(item).omit('name')
              };
            });
            var items = $sel.select2('data');
            this.cache = _.reject(items, function(item) {
              return (item.name.indexOf('<em>Searching for <strong>') >= 0);
            });
            $sel.select2({
              multiple: true,
              data: { results: d, text: 'name' }
            }).select2('data', this.cache).select2('open');
            $sel.remote = false;
          });
        } else {
          this.reload = true;
          delete this.temp;
        }
      } else {
        if ( e.choice.hasOwnProperty("unmatched") && e.choice.unmatched ){
          //remove the hint before adding it to the list
          e.choice.name = e.val;
        }
      }
    }).on('select2-blur', function(e) {
      if (!this.reload && this.temp) {
        this.reload = true;
        delete this.temp;
      }
    }).on('select2-open', function(e) {
      var el = this;
      if (this.reload) {
        this.cache = $sel.select2('data');
        setTimeout(function(){
          $sel.select2(settings).select2('data', el.cache).select2('open');
        }, 0);
        delete this.reload;
      }
    });
  },

  createDiff: function ( oldTags, currentTags){
    //sort tags into their needed actions
    //

    var out = {
      remove: [],
      add: [],
      none: []
    };

    var none = null;

    _.each(oldTags, function (oTag,oi){

      none = null;

      _.each(currentTags, function (cTag, ci){
          if (cTag && parseInt(cTag.id) == oTag.tagId ){
            currentTags.splice(ci,1);
            none = oi;
          }
        });

      if( _.isFinite(none) ){
        out.none.push(parseInt(oldTags[none].tagId));
      } else {
        out.remove.push(parseInt(oTag.id));
      }
    });

    out.add = currentTags;

    return out;
  }

});

module.exports = TagFactory;

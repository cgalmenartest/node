var _ = require('underscore');
var Backbone = require('backbone');
var d3 = require('d3');
var topojson = require('topojson');

'use strict';

var CountriesModel = Backbone.Model.extend({

  defaults: {
    countries: null
  },

  fetch: function (callbacks) {
    var self=this;
    if (this.countries) {
      // cached copy -- use it, never invalidate
      callbacks.success(this.countries);
    } else {
      // don't have a cached copy, load
      d3.json("/data/world-110m.json", function (err, world) {
        if (err) {
          if (callbacks.error) {
            callbacks.error(err);
          }
          return;
        }
        self.countries = topojson.feature(world, world.objects.countries).features;
        callbacks.success(self.countries);
      });
    }
  }

});

module.exports = CountriesModel;

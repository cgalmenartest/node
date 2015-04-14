// Use D3 to generate a nice looking world map with dots for our users.
//
// Note on picking the width and height in render(). This sets the
// height and width based on how the view is originally scaled.
// SVG scaling will take care of the rest to make it responsive.
// This approach will be good for small screens, but can look bad
// when you start small and scale up large.
//
// code for world map adapted from https://gist.github.com/mbostock/4180634
// and http://techslides.com/demos/d3/worldmap-template.html
// and http://bl.ocks.org/rveciana/5181105 (tooltips)

var _ = require('underscore');
var Backbone = require('backbone');
var d3 = require('d3');
var d3_tooltip = require('./d3_tooltip');


var PeopleMapView = Backbone.View.extend({

  initialize: function (options) {
    this.el = options.el;
    this.people = options.people;
    this.countries = options.countries;
    this.dotRange = options.dotRange || 5;
    this.smallestDotPx = 5;
    this.center = [0, 15];          // favor the northern hemisphere
    this.rotate = [-10, 0];         // break map cleanly in pacific
  },

  render: function () {
    // mercator projection is 960 x 500 @ 150 points, scale relative to that
    this.width = this.$el.width();
    this.height = Math.round(this.width / 2);
    this.scaleFactor = this.width / 960;

    this.svg = d3.select(this.el).append('svg')
      .attr("class", "box")
      .attr("preserveAspectRatio", "xMaxYMid")
      .attr("meetOrSlice", "slice")
      .attr("viewBox", "0 0 " + this.width + " " + this.height);

    this.renderCountries.call(this);
    this.renderUserDots.call(this);
  },

  renderCountries: function () {
    this.projection = d3.geo.mercator()
      .scale(150 * this.scaleFactor)
      .translate([Math.round(this.width / 2), Math.round(this.height / 2)])
      .center(this.center)
      .rotate(this.rotate);

    var path = d3.geo.path()
      .projection(this.projection);

    this.svg.append("g")
      .selectAll(".country")
      .data(this.countries)
      .enter()
      .insert("path", ".boundary")
      .attr("class", "country")
      .attr("d", path);
  },

  renderUserDots: function () {
    // don't count users who's location has no "data", e.g. our test cases
    var locations = this.people
      .pluck('location')
      .filter(function (p) {
        return !_.isUndefined(p);
      })
      .filter(function (p) {
        return !_.isUndefined(p.data);
      });
    var cities = _.groupBy(locations, 'name');
    var maxPeople = _.max(cities, function (cp) {
      return cp.length;
    }).length;

    var dotScale = d3.scale.linear()
      .domain([1, maxPeople])
      .range([
        this.smallestDotPx * this.scaleFactor,
        this.smallestDotPx * this.scaleFactor * this.dotRange
      ]);

    var usersG = this.svg.append("g");
    _.each(_.values(cities), function (cityPeople) {
      var detail = cityPeople[0].data;
      var projectedPoint = this.projection([detail.lon, detail.lat]);
      usersG.append("g")
        .attr("class", "userDot")
        .append("svg:circle")
        .attr("class", "point")
        .attr("cx", projectedPoint[0])
        .attr("cy", projectedPoint[1])
        .attr("r", dotScale(cityPeople.length))
        .call(d3_tooltip.add(function (d, i) {
            return "foo";
          }
        ));
    }, this);
  },

  close: function () {
    this.remove();
  }

});

module.exports = PeopleMapView;

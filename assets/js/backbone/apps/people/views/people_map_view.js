// Use D3 to generate a nice looking world map with dots for our users.
//
// Scaling: pick height and width based on how the view is originally
// scaled. SVG scaling will take care of the rest to make it responsive.
// staticScale stores what that was when map was first drawn, and
// dynamicScale changes as the SVG is resized.
//
// code for world map adapted from https://gist.github.com/mbostock/4180634
// and http://techslides.com/demos/d3/worldmap-template.html
// and http://bl.ocks.org/rveciana/5181105 (tooltips)

var _ = require('underscore');
var Backbone = require('backbone');
var d3 = require('d3');
var tooltipTemplate = require('../templates/people_map_tooltip.html');

var PeopleMapView = Backbone.View.extend({

  initialize: function (options) {
    this.el = options.el;
    this.people = options.people;
    this.countries = options.countries;
    this.smallestDotPx = 5;         // size of smallest dot
    this.dotSizeFactor = options.dotSizeFactor || 5;
    this.center = [0, 15];          // favor the northern hemisphere
    this.rotate = [-10, 0];         // break map cleanly in pacific
    this.tipDescTemplate = _.template(tooltipTemplate);
    this.tipXOffset = this.smallestDotPx;
  },

  render: function () {
    // mercator projection is 960 x 500 @ 150 points, scale relative to that
    this.width = this.$el.width();
    this.height = Math.round(this.width / 2);
    this.staticScale = this.width / 960;

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
      .scale(150 * this.staticScale)
      .translate([Math.round(this.width / 2), Math.round(this.height / 2)])
      .center(this.center)
      .rotate(this.rotate);

    this.path = d3.geo.path()
      .projection(this.projection);

    this.svg.append("g")
      .selectAll(".country")
      .data(this.countries)
      .enter()
      .insert("path", ".boundary")
      .attr("class", "country")
      .attr("d", this.path);
  },

  renderUserDots: function () {
    var that = this;
    var peopleWithLocations = this.people
      .filter(function (p) {
        return !_.isUndefined(p.get('location'));
      });
    var citiesPeople = _.groupBy(peopleWithLocations, function (p) {
      return p.get('location').name;
    });

    var dotScale = d3.scale.linear()
      .domain([1, _.max(citiesPeople, 'length').length])
      .range([
        this.smallestDotPx * this.staticScale,
        this.smallestDotPx * this.staticScale * this.dotSizeFactor
      ]);

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden");

    var usersG = this.svg.append("g");
    _.values(citiesPeople).forEach(function (cityPeople) {
      var cityLoc = cityPeople[0].get('location');
      var tipDesc = this.tipDescTemplate({
        city: cityLoc.name,
        count: cityPeople.length,
        names: _.map(cityPeople, function (p) {
          return p.get('name');
        }).slice(0, 3).join(', ')    // only show three names
      });

      if (!cityLoc.data || !cityLoc.data.lon || !cityLoc.data.lat) {
        console.log("Warning: skipped city, missing data:", cityLoc.name + ",",
          cityPeople.length, "users");
        return;
      }
      var projectedPoint = this.projection([cityLoc.data.lon, cityLoc.data.lat]);
      usersG.append("g")
        .attr("class", "userDot")
        .append("svg:circle")
        .attr("class", "point")
        .attr("cx", projectedPoint[0])
        .attr("cy", projectedPoint[1])
        .attr("r", dotScale(cityPeople.length))
        .attr("pointer-events", "all")
        .on("click", function () {
          window.cache.userEvents.trigger("people:list", {people: cityPeople})
        })
        .on("mouseover", function () {
          var dynamicScale = that.svg.node().width.animVal.value / 960;
          var dotR = that.svg.node().offsetLeft
            + ((this.cx.animVal.value + this.r.animVal.value) * dynamicScale);
          var dotT = that.svg.node().offsetTop
            + ((this.cy.animVal.value - this.r.animVal.value) * dynamicScale);
          tooltip.html(tipDesc)
            .style("visibility", "visible")
            .style("left", String(dotR + (that.tipXOffset * dynamicScale)) + "px")
            .style("top", String(dotT) + "px")
          return true;
        })
        .on("mouseout", function () {
          return tooltip.style("visibility", "hidden");
        })
    }, this);
  },

  close: function () {
    this.remove();
  }

});

module.exports = PeopleMapView;

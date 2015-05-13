var _ = require('underscore');
var Backbone = require('backbone');
var BaseController = require('../../../base/base_controller');
var PeopleMainTemplate = require('../templates/people_main_template.html');
var PeopleMapController = require('./people_map_controller');
var PeopleListController = require('./people_list_controller');
var async = require('async');


PeopleMain = {};

PeopleMain.Controller = BaseController.extend({

  events: {
    "user:logout:success":      "cleanup"
  },

  template: _.template(PeopleMainTemplate),

  initialize: function () {
    // not worth doing a whole separate view just for this, render here
    this.$el.html(this.template());
    this.peopleMapController = new PeopleMapController({
      el: '#people-map'
    });
    this.peopleListController = new PeopleListController({
      el: '#people-list'
    });
  },

  cleanup: function () {
    if (this.peopleMapController) {
      this.peopleMapController.cleanup();
    }
    if (this.peopleListController) {
      this.peopleListController.cleanup();
    }
  }

});

module.exports = PeopleMain.Controller;

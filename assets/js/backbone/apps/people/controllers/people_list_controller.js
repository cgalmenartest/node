var _ = require('underscore');
var Backbone = require('backbone');
var BaseController = require('../../../base/base_controller');
var async = require('async');
var PeopleListView = require('../views/people_list_view');
var ProfilesCollection = require('../../../entities/profiles/profiles_collection');


PeopleList = {};

PeopleList.Controller = BaseController.extend({

  initialize: function (options) {
    this.peoplelistView = new PeopleListView({
      el: options.el,
      people: options.people || []
    }).render();
  },

  cleanup: function () {
    if (this.peopleListView) {
      this.peopleListView.cleanup();
    }
  }

});

module.exports = PeopleList.Controller;

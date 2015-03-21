
var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var BaseController = require('../../../base/base_controller');
var HomeView = require('../views/home_view');


Home = {};

Home.Controller = BaseController.extend({

  events: {
  },

  // The initialize method is mainly used for event bindings (for efficiency)
  initialize: function (options) {
    var self = this;
    this.homeView = new HomeView().render();
  },

  // ---------------------
  //= Utility Methods
  // ---------------------
  cleanup: function() {
    if (this.homeView) this.homeView.cleanup();
    removeView(this);
  }

});

module.exports = Home.Controller;


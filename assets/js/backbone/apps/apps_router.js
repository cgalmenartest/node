var _ = require('underscore');
var Backbone = require('backbone');
var i18nOption = require('../config/i18n.json');
var BrowseApp = require('./browse/browse_app');


var initialize = function () {
  var router, browse;

  // Initialize the internationalization library and start Backbone when it's done initializing.
  $.i18n.init(i18nOption, function(t) {
    // Here we are going to fire up all the routers for our app to listen
    // in on their respective applications.  We are -testing- this functionality
    // by using the profile application as a starting point (very simple, 1 route).
    browse = BrowseApp.initialize();

    return Backbone.history.start({ pushState: true });
  });
}

module.exports = {
  initialize: initialize
};

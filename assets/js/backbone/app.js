/**
 * This is the main application bootstrap
 * that gets the rest of the apps, routers, etc
 * running.
 */

// Set up Backbone to use jQuery
var _ = require('underscore');
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = jQuery;


// Set CSRF header
$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  var token;
  if (!options.crossDomain) {
    token = $('meta[name="csrf-token"]').attr('content');
    if (token) {
      return jqXHR.setRequestHeader('X-CSRF-Token', token);
    }
  }
});

// Install jQuery plugins
// TODO require('blueimp-file-upload/js/vendor/jquery.ui.widget');
// TODO i18n = require('i18next-client/i18next.commonjs.withJQuery');
moment = require('moment');

// Set markdown defaults
var marked = require('marked');
// TODO var rendererWithExternalLinkSupport = require('../utils/rendererWithExternalLinkSupport')

/** TODO
marked.setOptions({
  sanitize: true,
  renderer: rendererWithExternalLinkSupport.renderer
});
**/

// App
window.Application      = window.Application || {};
window.cache            = { userEvents: {}, currentUser: null, system: {} };

// Events
window.entities = { request: {} };
rendering       = {};



// Global AJAX error listener. If we ever get an auth error, prompt to log
// in otherwise show the error.
$(function () {
  $(document).ajaxError(function (e, jqXHR, settings, errorText) {
    $('.spinner').hide();
    if (jqXHR.status === 401 || jqXHR.status === 403) {
      if (!window.cache || !window.cache.userEvents ||
        !('trigger' in window.cache.userEvents)) return;
      window.cache.userEvents.trigger("user:request:login", {
        disableClose: false,
        message: (jqXHR.responseJSON && jqXHR.responseJSON.message) || ""
      });
    } else {
      $('.alert-global')
        .html("<strong>" + errorText + "</strong>. " +
          (jqXHR.responseJSON && jqXHR.responseJSON.message) || "")
        .show();
    }
  });
});

// Load the application
var appr = require('./app-run');
appr.initialize();

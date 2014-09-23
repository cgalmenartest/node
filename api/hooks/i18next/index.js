module.exports = function (sails) {

  /**
   * Sails hook to add i18next functionality on the
   * server side, matching the i18next-client module
   * on the client side.
   */

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
      Hook = require('sails/lib/index'),
      i18next = require('i18next');


  /**
   * Expose hook definition
   */

  return {

    // Default options for server side only.
    // May be overridden in config/settings/i18next.js
    defaults : {
      i18next : {
        resGetPath : '/assets/locales/__lng__/__ns__.json',
        resSetPath : '/assets/locales/add/__lng__/__ns__.json'
      }
    },

    routes: {

      before: {

        //Make the i18next module available to all response objects.
        '/*': i18next.handle
      }
    },

    initialize: function (cb) {

      var initOptions = {};

      // Only include options that are explicitly set.
      if (i18next in sails.config) {
        if (config in sails.config.i18next) {
          if (cookieDomain in sails.config.i18next.config) {
            initOptions.cookieDomain = sails.config.i18next.config.cookieDomain;
          }
          if (cookieName in sails.config.i18next.config) {
            initOptions.cookieName = sails.config.i18next.config.cookieName;
          }
          if (dynamicLoad in sails.config.i18next.config) {
            initOptions.dynamicLoad = sails.config.i18next.config.dynamicLoad;
          }
          if (fallbackLng in sails.config.i18next.config) {
            initOptions.fallbackLng = sails.config.i18next.config.fallbackLng;
          }
          if (lng in sails.config.i18next.config) {
            initOptions.lng = sails.config.i18next.config.lng;
          }
          if (load in sails.config.i18next.config) {
            initOptions.load = sails.config.i18next.config.load;
          }
          if (ns in sails.config.i18next.config) {
            initOptions.ns = sails.config.i18next.config.ns;
          }
          if (saveMissing in sails.config.i18next.config) {
            initOptions.saveMissing = sails.config.i18next.config.saveMissing;
          }
          if (useCookie in sails.config.i18next.config) {
            initOptions.useCookie = sails.config.i18next.config.useCookie;
          }
        }
        if (debug in sails.config.i18next) {
          initOptions.debug = sails.config.i18next.debug;
        }
        if (detectLngFromHeaders in sails.config.i18next) {
          initOptions.detectLngFromHeaders =
            sails.config.i18next.detectLngFromHeaders;
        }
        if (detectLngFromPath in sails.config.i18next) {
          initOptions.detectLngFromPath =
            sails.config.i18next.detectLngFromPath;
        }
        if (detectLngQS in sails.config.i18next.config) {
          initOptions.detectLngQS = sails.config.i18next.config.detectLngQS;
        }
        if (resGetPath in sails.config.i18next) {
          // Assume the absolute path is compiled from the application path
          // and the path specified in the settings for the server side.
          // Note: This path is typically derived from the resGetPath
          // specified for the client, since that path is relative to the
          // home URL for the application.
          // To Do: Check for existence of the file at the specified path,
          // falling back to a relative path if needed.
          initOptions.resGetPath =
            sails.config.appPath + sails.config.i18next.resGetPath;
        }
        if (resSetPath in sails.config.i18next) {
          // Assume the absolute path is compiled from the application path
          // and the path specified in the settings for the server side.
          // To Do: Check for existence of the file as specified, falling back
          // to a relative path if needed.
          initOptions.resSetPath =
            sails.config.appPath + sails.config.i18next.resSetPath;
        }
        if (supportedLngs in sails.config.i18next) {
          initOptions.supportedLngs = sails.config.i18next.supportedLngs;
        }
      }

      i18next.init(initOptions);

      return cb();
    }

  };
};

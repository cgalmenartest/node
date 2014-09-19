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

    //Defaults for server side only, and only including the options
    //that need to be overridden from the module default.
    defaults: {
        resGetPath : '/assets/locales/__lng__/__ns__.json',
        resSetPath: '/assets/locales/__lng__/__ns__.json'
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
      if (sails.config.i18next.cookieName) {
        initOptions.cookieName = sails.config.i18next.cookieName;
      }
      if (sails.config.i18next.debug) {
        initOptions.debug = sails.config.i18next.debug;
      }
      if (sails.config.i18next.detectLngFromHeaders) {
        initOptions.detectLngFromHeaders = sails.config.i18next.detectLngFromHeaders;
      }
      if (sails.config.i18next.detectLngFromPath) {
        initOptions.detectLngFromPath = sails.config.i18next.detectLngFromPath;
      }
      if (sails.config.i18next.detectLngQS) {
        initOptions.detectLngQS = sails.config.i18next.detectLngQS;
      }
      if (sails.config.i18next.dynamicLoad) {
        initOptions.dynamicLoad = sails.config.i18next.dynamicLoad;
      }
      if (sails.config.i18next.fallbackLng) {
        initOptions.fallbackLng = sails.config.i18next.fallbackLng;
      }
      if (sails.config.i18next.lng) {
        initOptions.lng = sails.config.i18next.lng;
      }
      if (sails.config.i18next.load) {
        initOptions.load = sails.config.i18next.load;
      }
      if (sails.config.i18next.ns) {
        initOptions.ns = sails.config.i18next.ns;
      }
      if (sails.config.i18next.resGetPath) {
        initOptions.resGetPath = sails.config.appPath + sails.config.i18next.resGetPath;
      }
      if (sails.config.i18next.resSetPath) {
        initOptions.resSetPath = sails.config.appPath + sails.config.i18next.resSetPath;
      }
      if (sails.config.i18next.saveMissing) {
        initOptions.saveMissing = sails.config.i18next.saveMissing;
      }
      if (sails.config.i18next.supportedLngs) {
        initOptions.supportedLngs = sails.config.i18next.supportedLngs;
      }
      if (sails.config.i18next.useCookie) {
        initOptions.useCookie = sails.config.i18next.useCookie;
      }

      i18next.init(initOptions);
      i18next.registerAppHelper(sails);

      cb();
    }

  };
};

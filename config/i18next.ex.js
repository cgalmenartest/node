// import i18next configuration
var config = require('../assets/js/backbone/config/i18n.json');

module.exports = {
  // INTERNATIONALIZATION SETTINGS
  i18next : {
    resSetPath : '/assets/locales/add/__lng__/__ns__.json',
    resGetPath : '/assets/' + config.resGetPath,
    debug      : process.env.I18NEXT_DEBUG || false,
    detectLngFromHeaders : process.env.I18NEXT_LNG_HEADERS || true,
    detectLngFromPath    : process.env.I18NEXT_LNG_PATH || false,

    // Incorporate the i18n.json configuration object.
    config: config
  }
};

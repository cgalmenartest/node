var i18next = require('i18next'),
    i18nextSettings = require('./settings/i18next.js');

module.exports = {
  express: {
    customMiddleware: function(app)
    {
      // Install i18next helper functions.
      // Primarily done to set up storing the default strings for any missing translation keys
      // POSTed from the client.
      i18next.registerAppHelper(app);
    }
  }
}

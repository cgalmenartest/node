/**
 * Source definition for preparing delivery of notifications (preflight)
 *
 * @module    :: preflight.js
 * @description :: defines service methods for delivery preflights
 */
var _ = require('underscore');
var userUtils = require('../utils/user');

module.exports = {
  // don't modify delivery content
  execute: function (fields, settings, cb) {
    var content = {};
    // set all default global locals for email
    content.fields = _.extend({}, sails.services.utils.emailTemplate['generateEmailLocals'](settings.emailName));
    content.fields.metadata = sails.services.utils.emailTemplate['addGlobals'](fields.metadata || {});
    if (fields.metadata.recipient.username) {
      content.fields.to = fields.metadata.recipient.username;
    } else {
      content.fields.to = null;
    }
    // store userEmail object as metadata
    content.fields.metadata.userEmail = content.fields.to;
    content.fields.from = sails.config['systemEmail'];
    content.fields.subject = _.template(content.fields.subject)(content.fields.metadata);
    cb(null, content);
  }
};

/**
 * Source definition for preparing delivery of notifications (preflight)
 *
 * @module    :: preflight.js
 * @description :: defines service methods for delivery preflights
 */
module.exports = {
  // don't modify delivery content
  execute: function (fields, settings, cb) {
    cb(null, {});
  }
}
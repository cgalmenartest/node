/**
* Only allow owners or admins to pass through
*/
var _ = require('underscore');

module.exports = function addUserId (req, res, next) {
  // check if owner of the project or task
  if (req.isOwner || req.user.isAdmin) {
    return next();
  }
  // Otherwise not allowed.
  return res.forbidden('Not authorized');
};

/**
* Add new UUID to params
*/
var uuid = require('node-uuid');
module.exports = function eventUuid (req, res, next) {
  if (req.body) {
    req.body.uuid = uuid.v4();
  }
  next();
};

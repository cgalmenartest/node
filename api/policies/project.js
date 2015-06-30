/**
* Get the project referenced in :id and check if access is allowed
*/
var util = require('../services/utils/project')

module.exports = function project (req, res, next) {
  if (req.route.params.id) {
    var userId = null;
    if (req.user) {
      userId = req.user[0].id;
    }
    util.authorized(req.route.params.id, userId, function (err, proj) {
      if (err) { return res.send(400, { message: err }); }
      if (!err && !proj) { return res.send(403, { message: 'Not authorized.'}); }
      req.proj = proj;
      req.projectId = proj.id;
      req.isOwner = proj.isOwner;
      next();
    });
  // no :id is specified, so continue
  } else {
    next();
  }
};

/**
* Get the project referenced in :id and check if access is allowed
*/
//var _ = require('underscore');

module.exports = function project (req, res, next) {
  if (req.route.params.id) {
    Project.findOneById(req.route.params.id, function (err, proj) {
      if (err) { return res.send(400, { message: 'Error finding project.' } ); }
      req.project = proj;
      // otherwise, check that we have an owner
      ProjectOwner.findByProjectId(proj.id, function(err, owners) {
        if (err) { return res.send(400, { message: 'Error looking up owners.' } ); }
        proj.owners = [];
        proj.isOwner = false;
        for (var i = 0; i < owners.length; i++) {
          if (req.user && (owners[i].userId == req.user[0].id)) { proj.isOwner = true; }
          proj.owners.push({ id: owners[i].id, userId: owners[i].userId });
        }
        // If project is public or public and closed/finished, continue
        if ((proj.state === 'public') || (proj.state === 'closed') || (proj.isOwner)) {
          return next();
        }
        else {
          return res.send(403, { message: 'Not authorized.' } );
        }
      });
    });
  // no :id is specified, so continue
  } else {
    next();
  }
};
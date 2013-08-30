/**
 * ProjectOwnerController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

function checkOwner(owners, userId) {
  var allowed = false;
  // check and see if the current user is an owner
  if (owners.length > 0) {
    for (var i = 0; i < owners.length; i++) {
      if (owners[i].userId === userId) { allowed = true; break; }
    }
  } else {
    // there are no owners, so you must be the owner
    allowed = true;
  }
  return allowed;
}

module.exports = {

  create: function (req, res) {
    if (req.route.method != 'post') { return res.send(400, { message: 'Unsupported operation.' } ); }
    // Look up project
    var params = _.extend(req.body || {}, req.params);
    ProjectOwner.findByProjectId(params.projectId, function (err, proj) {
      if (err) { return res.send(400, { message: 'Error finding project owners.' } ); }
      if (!checkOwner(proj, params.userId)) { return res.send(403, { message: 'Unauthorized operation.' } ); }
      // create new owner
      ProjectOwner.create(params, function (err, owner) {
        if (err) { return res.send(400, { message: 'Error creating owner.' } ); }
        return res.send(owner);
      });
    });
  },

  destroy: function(req, res) {
    // DESTROY should be called with /projectowner/destory/:id
    // where id is the **projectOwner** id (not the projectId and not the userId)
    if (req.route.method != 'delete') { return res.send(400, { message: 'Unsupported operation.' } ); }
    ProjectOwner.findById(req.route.params.id, function (err, proj) {
      if (err) { return res.send(400, { message: 'Error finding project owners.' } ); }
      // Find the owners of this project
      ProjectOwner.findByProjectId(proj.projectId, function(err, owners) {
        if (!checkOwner(owners, params.userId)) { return res.send(403, { message: 'Unauthorized operation.' } ); }
        // delete user
        proj.destroy(function (err) {
          if (err) { return res.send(400, { message: 'Error destroying owner.' } ); }
          return res.send({ message: 'Operation successful.'});
        });
      });
    });
  }

};

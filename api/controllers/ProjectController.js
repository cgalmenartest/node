/**
 * ProjectController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  find: function(req, res) {
    // Find a given project and return the full information including owners.
    Project.findOneById(req.route.params.id, function (err, proj) {
      if (err) { return res.send(400, { message: 'Error finding project.' } ); }
      if (!proj) { return res.send({}); }
      ProjectOwner.findByProjectId(proj.id, function(err, owners) {
        proj.owners = [];
        proj.isOwner = false;
        for (var i = 0; i < owners.length; i++) {
          if (req.user && (owners[i].userId == req.user[0].id)) { proj.isOwner = true; }
          proj.owners.push({ id: owners[i].id, userId: owners[i].userId });
        }
        res.send(proj);
      });
    });
  },

	// Namespace the find() method that returns the array of objects into
	// a familiar findAll method. 
	findAll: function (req, res) {
		Project.find().done(function(err, projects) {
			if (err) return res.send(err, 500);
			res.send({ projects: projects });
		});
	},

  create: function (req, res) {
    if (req.route.method != 'post') { return res.send(400, { message: 'Unsupported operation.' } ); }
    var proj = _.extend(req.body || {}, req.params);
    Project.create(proj, function (err, newProj) {
      if (err) { return res.send(400, { message: 'Error creating project.' } ); }
      // Associate the user that created this project with the project
      ProjectOwner.create({ projectId: newProj.id,
                            userId: req.user[0].id
                          }, function (err, projOwner) {
        if (err) { return res.send(400, { message: 'Error storing project owner.' } ); }
        newProj.owners = [ projOwner ];
        return res.send(newProj);
      });
    });
  }

};

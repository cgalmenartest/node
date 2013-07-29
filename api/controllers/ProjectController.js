/**
 * ProjectController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

	// Namespace the find() method that returns the array of objects into
	// a familiar findAll method. 
	findAll: function (req, res) {
		Project.find().done(function(err, projects) {
			if (err) return res.send(err, 500);
			res.send({ projects: projects });
		});
	}

};

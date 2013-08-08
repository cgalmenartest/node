/**
 * CommentController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

	findAllByProject: function (req, res) {
		Comment.findByProjectId(req.param("projectId")).done(function(err, comments) {
			if (err) return res.send(err, 500);
			res.send({ comments: comments });
		});
	}

};

/**
 * CommentController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

	findAllByProjectId: function (req, res) {
		Comment.findByProjectId(req.params.id, function(err, comments) {
			if (err) return res.send(err, 500);
			res.send({ comments: comments });
		});
	}

};

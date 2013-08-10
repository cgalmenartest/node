/**
 * CommentController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var _ = require('underscore');

module.exports = {

	findAllByProjectId: function (req, res) {
		Comment.findByProjectId(req.params.id, function(err, comments) {
			if (err) return res.send(err, 500);
      var newArray = {};
      // Create an associative array to attach children
      for (var i = 0; i < comments.length; i++) {
        if (!comments[i].parentId) {
          newArray[comments[i].id] = comments[i];
        }
      }
      // Find children and attach them to their parent
      for (var i = 0; i < comments.length; i++) {
        if (comments[i].parentId) {
          var parent = newArray[comments[i].parentId]
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(comments[i]);
        }
      }
      // Only return the array, not the associative array
      res.send({ comments: _.values(newArray) });
		});
	}

};

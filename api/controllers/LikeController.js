/**
 * LikeController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  /**
   * Override find to only find for this userid
   * Syntax: /like/find returns all likes for that user
   * Otherwise /like/find/:id looks up likes for that project id
   */
  find: function (req, res) {
    if (!req.user) { return res.send(403, { message: 'Not authorized' }); }
    // :id specified, look up projectId
    if (req.params.id) {
      Like.findOne({ where: { projectId: req.params.id, userId: req.user[0].id } },
        function (err, like) {
          if (err) { return res.send(400, { message: 'Error looking up likes.' }); }
          if (like) { return res.send(true); }
          return res.send(false);
      });
    }
    // Otherwise look up all the likes for this user.
    else {
      Like.findByUserId(req.user[0].id, function (err, likes) {
        if (err) { return res.send(400, { message: 'Error looking up likes.' }); }
        var result = [];
        for (var i = 0; i < likes.length; i++) {
          result.push({ id: likes[i].id, projectId: likes[i].projectId });
        }
        return res.send(result);
      });
    }
  },

  /**
   * Get the number of likes for a project
   * Syntax: /like/count/:projectId
   */
  count: function (req, res) {
    Like.countByProjectId( req.params.id, function (err, likes) {
      return res.send({ projectId: req.params.id, count: likes });
    });
  },

  /**
   * Helper function so you don't have to call create
   * Syntax: /like/like/:projectId where :id is the projectId
   */
  like: function (req, res) {
    var like = { projectId: req.params.id, userId: req.user[0].id };
    Like.findOne({ where: like}, function (err, existing) {
      if (err) { return res.send(400, { message: 'Error creating like.' }); }
      if (existing) { return res.send(existing); }
      Like.create(like, function (err, like) {
        if (err) { return res.send(400, { message: 'Error creating like.' }); }
        return res.send(like);
      });
    });
  },

  /**
   * Helper function so you don't have to call destroy
   * Syntax: Call /like/unlike/:projectId where :id is the projectId
   */
  unlike: function (req, res) {
    Like.findOne({ where: { projectId: req.params.id, userId: req.user[0].id }}, function (err, like) {
      if (err) { return res.send(400, { message: 'Error finding like.' }); }
      if (!like) { return res.send(null); }
      like.destroy(function(err) {
        if (err) { return res.send(400, { message: 'Error destroying like.' }); }
        return res.send(null);
      });
    });
  }

};

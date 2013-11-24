/**
 * LikeController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var like = function (l, cb) {
  Like.findOne({ where: l }, function (err, existing) {
    if (err) { return cb(err, null); }
    if (existing) { return cb(null, existing); }
    Like.create(l, function (err, newLike) {
      if (err) { return cb(err, null); }
      return cb(null, newLike);
    });
  });
};

var unlike = function (l, cb) {
  Like.findOne({ where: l}, function (err, newLike) {
    if (err) { return cb(err); }
    if (!newLike) { return cb(null); }
    newLike.destroy(function(err) {
      return cb(err);
    });
  });
};

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
      var where = {
        userId: req.user[0].id
      };
      if (req.param('type') == 'user') {
        where.targetId = req.params.id;
      } else if (req.param('type') == 'task') {
        where.taskId = req.params.id;
      } else {
        where.projectId = req.params.id;
      }
      Like.findOne({ where: where }, function (err, like) {
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
          var l = { id: likes[i].id }
          if (likes[i].projectId) {
            l.projectId = likes[i].projectId;
          }
          if (likes[i].taskId) {
            l.taskId = likes[i].taskId;
          }
          if (likes[i].targetId) {
            l.targetId = likes[i].targetId;
          }
          result.push(l);
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
   * Get the number of likes for a target user
   */
  countt: function (req, res) {
    Like.countByTaskId( req.params.id, function (err, likes) {
      return res.send({ userId: req.params.id, count: likes });
    });
  },

  /**
   * Get the number of likes for a target user
   */
  countu: function (req, res) {
    Like.countByTargetId( req.params.id, function (err, likes) {
      return res.send({ userId: req.params.id, count: likes });
    });
  },

  /**
   * Helper function so you don't have to call create
   * Syntax: /like/like/:projectId where :id is the projectId
   */
  like: function (req, res) {
    var l = { projectId: req.params.id, userId: req.user[0].id };
    like(l, function (err, like) {
      if (err) { return res.send(400, { message: 'Error creating like.' }); }
      return res.send(like);
    });
  },

  /**
   * Helper function so you don't have to call create
   * Syntax: /like/likeu/:userId where :id is the userId
   */
  liket: function (req, res) {
    var l = { taskId: req.params.id, userId: req.user[0].id };
    like(l, function (err, like) {
      if (err) { return res.send(400, { message: 'Error creating like.' }); }
      return res.send(like);
    });
  },

  /**
   * Helper function so you don't have to call create
   * Syntax: /like/likeu/:userId where :id is the userId
   */
  likeu: function (req, res) {
    var l = { targetId: req.params.id, userId: req.user[0].id };
    like(l, function (err, like) {
      if (err) { return res.send(400, { message: 'Error creating like.' }); }
      return res.send(like);
    });
  },

  /**
   * Helper function so you don't have to call destroy
   * Syntax: Call /like/unlike/:projectId where :id is the projectId
   */
  unlike: function (req, res) {
    var l = { projectId: req.params.id, userId: req.user[0].id };
    unlike(l, function (err) {
      if (err) { return res.send(400, { message: 'Error destroying like.' }); }
      return res.send(null);
    });
  },

  /**
   * Helper function so you don't have to call destroy
   * Syntax: Call /like/unlikeu/:userId where :id is the userId
   */
  unliket: function (req, res) {
    var l = { taskId: req.params.id, userId: req.user[0].id };
    unlike(l, function (err) {
      if (err) { return res.send(400, { message: 'Error destroying like.' }); }
      return res.send(null);
    });
  },

  /**
   * Helper function so you don't have to call destroy
   * Syntax: Call /like/unlikeu/:userId where :id is the userId
   */
  unlikeu: function (req, res) {
    var l = { targetId: req.params.id, userId: req.user[0].id };
    unlike(l, function (err) {
      if (err) { return res.send(400, { message: 'Error destroying like.' }); }
      return res.send(null);
    });
  }
};

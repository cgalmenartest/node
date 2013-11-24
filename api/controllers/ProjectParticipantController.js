/**
 * ProjectParticipantController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

var projUtils = require('../services/utils/project');

module.exports = {

  create: function (req, res) {
    // Look up project
    var params = _.extend(req.body || {}, req.params);
    ProjectParticipant.findByProjectId(params.projectId, function (err, proj) {
      if (err) { return res.send(400, { message: 'Error finding project participants.' } ); }
      // create new participant
      ProjectParticipant.create(params, function (err, participant) {
        if (err) { return res.send(400, { message: 'Error creating participant.' } ); }
        return res.send(participant);
      });
    });
  },

  destroy: function(req, res) {
    // DESTROY should be called with /projectparticipant/destroy/:id
    // where id is the **projectParticipant** id (not the projectId and not the userId)
    ProjectParticipant.findOneById(req.route.params.id, function (err, proj) {
      if (err) { return res.send(400, { message: 'Error finding project participant.' } ); }
      projUtils.authorized(proj.projectId, req.user[0].id, function (err, p) {
        if (err) { return res.send(400, { message: err }); }
        if (!err && !p) { return res.send(403, { message: 'Not authorized.'}); }
        // delete participant object
        proj.destroy(function (err) {
          if (err) { return res.send(400, { message: 'Error destroying participant.' } ); }
          return res.send({ message: 'Operation successful.'});
        });
      });
    });
  }

};

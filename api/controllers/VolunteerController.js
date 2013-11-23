/**
 * VolunteerController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  create: function (req, res) {
    var v = _.extend(req.body || {}, req.params);
    Volunteer.findOrCreate(v, v, function(err, newV) {
      if (err) { return res.send(400, { message: 'Error creating volunteer entry' }); }
      return res.send(newV);
    });
  }

};

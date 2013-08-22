/**
 * EventController
 *
 * @module		:: Controller
 * @description	:: Interaction with events
 */

module.exports = {

  findAllByProjectId: function (req, res) {
    Event.findByProjectId(req.params.id, function (err, events) {
      if (err) return res.send(400, { message: 'Error looking up events.'});
      res.send({ events: events });
    });
  },

  // Generate an iCal calendar for a given project id
  ical: function (req, res) {
    Event.findByProjectId(req.params.id, function (err, events) {
      if (err) return res.send(400, { message: 'Error looking up events.'});
      // generate iCal entries here
      res.send({ events: events });
    });
  }

};

/**
 * EventController
 *
 * @module		:: Controller
 * @description	:: Interaction with events
 */

var icalendar = require('icalendar');
var projUtils = require('../services/projectUtils');

module.exports = {

  'find': function (req, res) {
    Event.findOneById(req.params.id, function (err, ev) {
      if (err) { return res.send(400, { message: 'Error looking up events.'}); }
      var userId = null;
      if (req.user) {
        userId = req.user[0].id;
      }
      projUtils.authorized(ev.projectId, userId, function (err, proj) {
        if (err) { return res.send(400, { message: err }); }
        if (!err && !proj) { return res.send(403, { message: 'Not authorized.'}); }
        res.send(ev);
      });
    });
  },

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
      // generate iCal entries
      var ical = new icalendar.iCalendar();
      // set calendar name (X-WR-CALNAME?)
      for (var i = 0; i < events.length; i++) {
        var ev = new icalendar.VEvent(events[i].uuid);
        ev.setSummary(events[i].title);
        ev.setDate(new Date(events[i].start), new Date(events[i].end));
        ev.setDescription(events[i].description);
        if (events[i].location) {
          ev.addProperty('LOCATION', events[i].location);
        }
        // set location
        // set status
        ical.addComponent(ev);
      }
      res.type('text/calendar');
      res.send(ical.toString());
    });
  }

};

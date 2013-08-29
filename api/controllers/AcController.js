/**
 * AcController
 *
 * @module		:: Controller
 * @description	:: Auto-complete service
 */

var async = require('async');

var runSearch = function(type, q, cb) {
  var results = [];

  var callSource = function(source, done) {
    // Get the source definition that matches the source name
    var src = sails.config.sources.sources[source];
    // Find the source actor that can perform the query
    var actor = sails.services.sources[src.type];
    // Run the query and add the results
    actor.query(q, src, function(err, r) {
      if (!err) {
        results = results.concat(r || []);
      }
      done(err);
    });
  };

  // Iterate through each source and query it, compiling the results
  async.each(sails.config.sources.autocomplete[type], callSource, function(err) {
    cb(err, results);
  });

}

module.exports = {

  search: function (req, res) {
    if (!req.param('q')) { return res.send([]); }
    runSearch('search', req.param('q'), function (err, results) {
      if (err) { return res.send(400, { message: 'Error performing search' }); }
      return res.send(results);
    });
  },

  attachments: function (req, res) {
    if (!req.param('q')) { return res.send([]); }
    runSearch('attachments', req.param('q'), function (err, results) {
      if (err) { return res.send(400, { message: 'Error performing search' }); }
      return res.send(results);
    });
  },

  inline: function (req, res) {
    if (!req.param('q')) { return res.send([]); }
    runSearch('inline', req.param('q'), function (err, results) {
      if (err) { return res.send(400, { message: 'Error performing search' }); }
      return res.send(results);
    });
  },

  test: function (req, res) {
    if (!req.param('q')) { return res.send([]); }
    runSearch('test', req.param('q'), function (err, results) {
      if (err) { return res.send(400, { message: 'Error performing search' }); }
      return res.send(results);
    });
  }

};

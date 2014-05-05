/**
 * Source definition for searching a mediawiki instance
 *
 * @module    :: Source
 * @description :: Search mediawiki API for a term
 */
var request = require('request');

module.exports = {
  /**
   * Query the source for a term, given a config
   * requires in the configuration:
   *  - apiUrl : the URL of the mediawiki api
   */
  query: function (term, params, config, cb) {
    var url = config.apiUrl + term;
    var results = [];
    request.get(url, function(err, response, body) {
      if (err) { return cb(err, null); }
      if (!body || response.statusCode != 200) { return cb("Error connecting to " + url + " - code " + response.statusCode, null); }
      var b = JSON.parse(body);
      var search = b.query.search;
      for (var i = 0; i < search.length; i++) {
        if (config.limit && (i >= config.limit)) {
          break;
        }
        results.push( { value: search[i].title,
                        field: 'title',
                        target: config.target.toLowerCase(),
                        link: config.baseUrl + encodeURIComponent(search[i].title),
                        image: '/images/ac/wikipedia.png'
                      } );
      }
      return cb(null, results);
    });
  }
}
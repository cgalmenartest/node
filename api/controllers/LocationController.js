var request = require('request'),
    qs = require('querystring');

module.exports = {

  /**
  * Suggestion API for locations powered by GeoNames
  * Documentation here: http://www.geonames.org/export/geonames-search.html
  **/
  suggest: function(req, res) {

    var urlBase = 'http://api.geonames.org/search',
        query = _.defaults(req.query, {
          type: 'json',
          style: 'full',
          maxRows: 10,
          username: 'midas',
          countryBias: 'US',
          featureClass: 'P'
        }),
        url = urlBase + '?' + qs.stringify(query);

    request.get({ url: url, json: true }, function(err, r, data) {
      if (err) return res.json(err);
      if (!data.geonames) return res.json(data);
      res.json(data.geonames.map(function(item) {
        var name = [item.toponymName];
        if (item.toponymName !== item.adminName1) name.push(item.adminName1);
        if (item.countryCode !== 'US') name.push(item.countryCode);
        return {
          name: name.join(', '),
          lat: item.lat,
          lon: item.lng,
          timezone: item.timezone,
          source: 'geonames',
          sourceId: item.geonameId
        };
      }));

    });

  }

}

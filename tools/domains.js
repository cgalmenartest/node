var _ = require('underscore');
var async = require('async');
var request = require('request');

var domains = [
      // Federal non-.gov domains
      {
        url: 'http://govt-urls.usa.gov/tematres/vocab/services.php?output=json&task=fetchDown&arg=17',
        json: true,
      },
      // Federal .gov domains
      {
        url: 'http://govt-urls.usa.gov/tematres/vocab/services.php?output=json&task=fetchDown&arg=11928',
        json: true
      }
    ];

async.map(domains, get, function(err, domains) {
  if (err) return console.error(err);
  domains = _(domains).chain().pluck('result').reduce(function(memo, values) {
    return _(memo).extend(values);
  }, {}).values().pluck('string').unique().value().sort();
  console.log(JSON.stringify(domains, null, 4));
});

function get(domain, callback) {
  request.get(domain, function(err, res, json) {
    if (err) return callback(err);
    callback(null, json);
  });
}

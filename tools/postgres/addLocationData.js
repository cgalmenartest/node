var Sails = require('sails'),
    async = require('async'),
    request = require('request');

Sails.lift({}, function(err, sails) {
  if (err) return console.error(err);

  TagEntity.find({}).exec(function(err, files) {
    if (err) return console.error(err);
    async.each(files, addData, function(err) {
      if (err) console.error(err);
      console.log('Shutting down server');
      Sails.lower();
    });
  });

  function addData(tag, cb) {
    if (tag.data || tag.type !== 'location') return cb();
    request({
      url: sails.config.httpProtocol + '://' +
        sails.config.hostName +  '/api/location/suggest?q=' +
        encodeURIComponent(tag.name),
      json: true
    }, function(err, res, body) {
      if (err) return cb(err);
      if (!body[0]) {
        console.log('No location data found for ' + tag.name);
        return cb();
      }
      var data = _.omit(body[0], 'name');
      TagEntity.update(tag.id, { data: data }).exec(function(err) {
        if (err) return cb(err);
        console.log('Added location data for ' + tag.name);
        cb();
      });
    });
  }
});

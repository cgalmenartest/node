var conf = require('./config'),
    async = require('async');

require('sails').lift({
  validateDomains: false,
  emailProtocol: '',
  hooks: {
    grunt: false,
    sockets: false,
    pubsub: false,
    csrf: false,
    http: false,
    views: false
  }
}, function(err, sails) {
  if (err) throw err;
  TagEntity.count({}).exec(function(err, count) {
    if (err) throw 'Failed to init tags.';
    if (count > 0) return console.log('Skipping tag init.');
    async.forEach(conf.tags, TagEntity.create, function(err) {
      sails.lower();
    });
  });
});

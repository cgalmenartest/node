var conf = require('./config'),
    async = require('async');

require('sails').lift({
  validateDomains: false,
  emailProtocol: '',
  hooks: {
    grunt: false,
    sockets: false,
    pubsub: false,
    csrf: false
  }
}, function(err, sails) {
  if (err) throw err;
  async.forEach(conf.tags, TagEntity.create, function(err) {
    sails.lower();
  });
});

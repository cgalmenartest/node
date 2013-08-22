var conf = require('./config');
var fs = require('fs');
var request = require('request');

module.exports = {
  init: function(keepDb) {
    if (fs.existsSync('./.tmp/disk.db') && (keepDb !== true)) {
      fs.unlinkSync('./.tmp/disk.db');
    }
    var j = request.jar();
    var r = request.defaults({ jar: j, followRedirect: false });
    return r;
  },

  login: function(request, cb) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.username, password: conf.password },
                 }, function(err, response, body) {
      if (err) { return cb(err); }
      request(conf.url + '/user', function(err, response, body) {
        if (err) { return cb(err); }
        if (response.statusCode !== 200) {
          cb('Error: Login unsuccessful. ' + body)
        }
        cb(null);
      });
    });

  }

};
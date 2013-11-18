var conf = require('./config');
var fs = require('fs');
var request = require('request');

module.exports = {
  init: function(keepDb) {
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
  },

  createProject: function(request, public, cb) {
    if (!public) {
      conf.project.state = 'draft';
    } else {
      conf.project.state = 'public';
    }
    request.post({ url: conf.url + '/project',
                   body: JSON.stringify(conf.project)
                 }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  createTask: function (req, cb) {
    req.post({
      url: conf.url + '/task',
      body: JSON.stringify(conf.task)
    }, function (err, res, body) {
      if (err) return cb(err, null);
      var b = JSON.parse(body);
      cb(null, b);
    });
  }

};
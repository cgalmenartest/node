var conf = require('./config');
var fs = require('fs');
var request = require('request');
var path = require('path');

module.exports = {
  init: function () {
    var j = request.jar();
    var r = request.defaults({ jar: j, followRedirect: false });
    return r;
  },

  login: function (request, username, password, cb) {
    // logout first
    request.get({ url: conf.url + '/auth/logout' }, function (err, response, body) {
      if (err) { return cb(err); }
      // then login
      request.post({ url: conf.url + '/auth/local',
                     form: { username: username, password: password },
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
    });
  },

  user_info: function (request, cb) {
    var r = request.get({
      url: conf.url + '/user/'
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  user_put: function (request, user, cb) {
    var r = request.put({
      url: conf.url + '/user/' + user.id,
      body: JSON.stringify(user)
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  user_disable: function (request, user, cb) {
    var r = request.get({
      url: conf.url + '/user/disable/' + user.id,
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  file_create: function(request, filename, square, cb) {
    var r = request.post({
      url: conf.url + '/file'
    }, function (err, response, body) {
      if (err) return cb(err, null);
      var b = JSON.parse(body);
      return cb(null, b);
    });
    var form = r.form();
    if (square === true) {
      form.append('type', 'image_square');
    }
    form.append('file', fs.createReadStream(path.join(__dirname, filename)));
  },

  post: function (request, url, obj, cb) {
    request.post({ url: url,
                   body: JSON.stringify(obj)
                 }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  proj_create: function(request, proj, cb) {
    this.post(request, conf.url + '/project', proj, cb);
  },

  projowner_create: function(request, proj, cb) {
    this.post(request, conf.url + '/projectowner', proj, cb);
  },

  proj_put: function(request, proj, cb) {
    var r = request.put({
      url: conf.url + '/project',
      body: JSON.stringify(proj)
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  comment_create: function(request, comment, cb) {
    this.post(request, conf.url + '/comment', comment, cb);
  },

  event_create: function(request, ev, cb) {
    this.post(request, conf.url + '/event', ev, cb);
  },

  task_create: function(request, task, cb) {
    this.post(request, conf.url + '/task', task, cb);
  },

  tag_find: function(request, name, type, cb) {
    var url = conf.url + '/ac/tag?q=' + name;
    if (type) {
      url = url + '&type=' + type;
    }
    var r = request.get({
      url: url
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      for (i in b) {
        if (b[i].name.toLowerCase() == name.toLowerCase()) {
          return cb(null, b[i]);
        }
      }
      cb(null, null);
    });
  },

  tag_add: function(request, tag, cb) {
    this.post(request, conf.url + '/tag/add', tag, cb);
  },

  tag_create: function(request, tag, cb) {
    this.post(request, conf.url + '/tag', tag, cb);
  }

};
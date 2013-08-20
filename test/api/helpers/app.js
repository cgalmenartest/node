var spawn = require('child_process').spawn;
var sailsBin = './node_modules/sails/bin/sails.js';
var conf = require('./config');

module.exports = {
  spawn: function() {
    var sailsServer = spawn(sailsBin, ['lift'], { env: conf.env });
    return sailsServer;
  },
  spawnAsync: function(cb) {
    var sailsServer = spawn(sailsBin, ['lift'], { env: conf.env });
    var lifted = false;
    var dataString = '';
    sailsServer.stdout.on('data', function(data) {
      if (lifted) { return; }
      dataString = dataString + data;
      // If the server lifted, it passed
      if (dataString.indexOf('Server lifted') !== -1) {
        lifted = true;
        return cb(sailsServer, dataString);
      }
      // Otherwise check for an error message
      if (dataString.toLowerCase().indexOf('error') !== -1) {
        lifted = true;
        sailsServer.kill();
        return cb(null, dataString);
      }
    });
  },
  kill: function(sailsServer) {
    sailsServer.kill('SIGINT');
  }
};
var spawn = require('child_process').spawn;
var wrench = require('wrench');
var sailsBin = './node_modules/sails/bin/sails.js';
var conf = require('./config');

var kill = function(sailsServer, cb) {
  sailsServer.on('exit', function(code, signal){
    cb();
  });
  sailsServer.kill('SIGINT');
};

module.exports = {
  spawnSync: function() {
    // clean out the database directories
    wrench.rmdirSyncRecursive('./.tmp', true);
    var sailsServer = spawn(sailsBin, ['lift'], { env: conf.env });
    return sailsServer;
  },
  spawn: function(cb) {
    // clean out the database directories
    wrench.rmdirSyncRecursive('./.tmp', true);
    console.log(sailsBin);
    var sailsServer = spawn(sailsBin, ['lift'], { env: conf.env });
    var lifted = false;
    var dataString = '';
    sailsServer.stdout.on('data', function(data) {
      if (lifted) { return; }
      dataString = dataString + data;
      console.log(dataString);
      // If the server lifted, it passed
      if (dataString.indexOf('Server lifted') !== -1) {
        lifted = true;
        return cb(sailsServer, dataString);
      }
      // Otherwise check for an error message
      if (dataString.toLowerCase().indexOf('error') !== -1) {
        lifted = true;
        kill(sailsServer, function() {
          return cb(null, dataString);
        });
      }
    });
  },
  kill: kill
};

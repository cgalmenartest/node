var spawn = require('child_process').spawn;
var fs = require('fs');
var _ = require('underscore');
var conf = require('./config');
var sailsBin = './node_modules/sails/bin/sails.js';

var kill = function(sailsServer, cb) {
  sailsServer.on('exit', function(code, signal){
    cb();
  });
  sailsServer.kill('SIGINT');
};

module.exports = {
  spawnSync: function() {
    // remove the database directories
    if (fs.existsSync('./tmp/disk.db')) {
      fs.unlinkSync('./tmp/disk.db');
    }
    // wrench.rmdirSyncRecursive('./.tmp', true);
    // var sailsServer = spawn(sailsBin, ['lift'], { env: conf.env });
    var sailsServer = spawn(sailsBin, ['lift'], { env: _.extend(process.env, conf.env) });
    return sailsServer;
  },
  spawn: function(cb) {
    // remove the database
    if (fs.existsSync('./tmp/disk.db')) {
      fs.unlinkSync('./tmp/disk.db');
    }
    // wrench.rmdirSyncRecursive('./.tmp', true);
    // var sailsServer = spawn(sailsBin, ['lift'], { env: conf.env });
    var sailsServer = spawn(sailsBin, ['lift'], { env: _.extend(process.env, conf.env) });
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
        kill(sailsServer, function() {
          return cb(null, dataString);
        });
      }
    });
  },
  kill: kill
};

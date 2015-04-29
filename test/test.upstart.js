/*
   Global before() and after() launcher for Sails application
   to run tests like Controller and Models test
*/
var fs = require('fs');

var sails;
var err;

process.env.NODE_ENV = (process.argv.indexOf('--development') >= 0) ? 'development' : 'test';

before(function(done) {
  console.log('lifting sails: env='+process.env.NODE_ENV );

  var config = {
    // turn down the log level so we can view the test results
    log: {
      level: 'error'
    },
    hooks: {
      grunt: false,
      sockets: false,
      pubsub: false,
      csrf: false
    }
  }

  if (process.env.NODE_ENV == 'test') {
    // remove the database directories
    if (fs.existsSync('./.tmp/disk.db')) {
      fs.unlinkSync('./.tmp/disk.db');
    }
    config.adapters = {
      'default': 'disk'
    }
  }
  // Lift Sails and store the app reference
  require('sails').lift(config, function(e, s) {
    sails = s;
    err = e;
    // export properties for upcoming tests with supertest.js
    sails.localAppURL = localAppURL = ( sails.usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + '';
    // save reference for teardown function

    //Add temp userauth
    sails.models.userauth.create({
      userId: 4,
      provider: 'test',
      accessToken: 'testCode'
    }, function(err, model) {
      done(err);
    })
  });

});

// After Function
after(function(done) {
  console.log('\nLowering sails');
  sails.lower(done);
});

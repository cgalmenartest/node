var sails = require('sails');

before(function(done) {
  console.log('lifting sails: env='+process.env.NODE_ENV );

  var config = {
    environment: 'test',
    // turn down the log level so we can view the test results
    log: {
      level: 'error'
    },
    csrf: false,
    connections: {
      testDB: {
        adapter: 'sails-memory'
      }
    },
    models: {
      connection: 'testDB'
    }
    // TODO: validateDomains: false,
    // TODO: requireAgency: false,
    // TODO: requireLocation: false,
    // TODO: emailProtocol: '',
    // TODO: taskState: 'draft',
    // TODO: draftAdminOnly: false,
  };

  sails.lift(config, function(err, server) {
    if (err) return done(err);
    // here you can load fixtures, etc.
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});

beforeEach(function(done) {
  // Drops database between each test.  This works because we use
  // the memory database
  sails.once('hook:orm:reloaded', done);
  sails.emit('hook:orm:reload');
});

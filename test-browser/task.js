var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var casper_chai = require('casper-chai');
chai.use(casper_chai);

// access environment vars
var system = require('system');

describe('Task page', function() {
  before(function() {
    casper.start(system.env.TEST_ROOT + '/tasks', function afterStart() {
      this.options = {
        verbose: true,
        logLevel: "debug",
        waitTimeout: 5000
      }
      this.on('remote.message', function(message) {
        this.log('browser console.log ==> ' + message);
      });
    }).viewport(1000,1000).userAgent('Mozilla/5.0')

  })

  it('should have success status', function() {
    casper.then(function() {
      assert.equal(casper.currentHTTPStatus,200);
    })
  })

  it('should have task list', function() {
    casper.then(function() {
      casper.waitForSelector('#browse-list', loaded, failed, 1000 * 15);
      function loaded() {
        assert.ok(true);
      }
      function failed() {
        assert.ok(false);
      }
    });
  });

  after(function() {
    casper.exit();
  });

});

var assert = require('assert');
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var request;

describe('event:', function() {

  describe('logged in:', function() {

    before(function(done) {
      request = utils.init();
      utils.login(request, function(err) {
        done(err);
      });
    });

    it('null', function(done) {
      // utils.logout(request, function(err) {

      // })
      done();
    });

  });

  describe('logged out:', function() {

    before(function() {
      request = utils.init(true);
    });

    it('null', function(done) {
      // utils.logout(request, function(err) {

      // })
      done();
    });
  });

});

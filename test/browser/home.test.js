var config = require('../init/init/config');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var casper_chai = require('casper-chai');
chai.use(casper_chai);

// access environment vars
var system = require('system');

/**
 *
 * Home page tests
 *
 */

before(function() {
  casper.start(system.env.TEST_ROOT, function afterStart() {
    this.options = {
      waitTimeout: 1000 * 15
    };
    this.on('remote.message', function(message) {
      this.log('browser console.log ==> ' + message);
    });
  }).viewport(1000,1000).userAgent('Mozilla/5.0');
});

describe('Home page', function() {

  it('should have success status', function() {
    casper.then(function() {
      assert.equal(casper.currentHTTPStatus,200);
    });
  });

  it('should have correct title', function() {
    casper.then(function() {
      assert.equal(casper.getTitle(), "midas");
    });
  });

  it('should link to /tasks', function() {
    casper.then(function() {
      casper.waitForText('Opportunities', function waitForTextOpportunities() {
        casper.click('.tasks .nav-link[href]');
        assert.equal(casper.getCurrentUrl(), system.env.TEST_ROOT + '/tasks');
      });
    });
  });

  it('should create a new account', function() {
    var submitButton = '#registration-form button[type="submit"]';

    // Click the login button
    casper.then(function(){
      casper.click('.login');
      casper.waitForSelector('#login-register');
    });

    // Click the "sign up now" button
    casper.then(function() {
      casper.click('#login-register');
      casper.waitForSelector('#registration-form');
    });

    // Fill out the registration form
    casper.then(function() {
      casper.fillSelectors('#registration-form', {
        '#rname': 'Test User',
        '#rusername': config.user.username,
        '#rpassword': config.user.password,
        '#rpassword-confirm': config.user.password
      }, false);
      casper.waitForSelector(submitButton);
    });

    // Click the "register" button
    casper.then(function() {
      casper.click(submitButton);
      casper.waitForSelector('.profile.dropdown');
    });

    // Verify that account was created and user is logged in
    casper.then(function(){
      var username = casper.evaluate(function() {
        return window.cache.currentUser.username;
      });
      assert.equal(username, config.user.username);
    });

  });

  it('should log out', function() {

    // Click the log out button
    casper.then(function() {
      casper.click('a.logout');
      casper.waitForSelector('a.login');
    });

    // Verify that the user is not logged in
    casper.then(function() {
      var username = casper.evaluate(function() {
        return window.cache.currentUser.username;
      });
      assert.isNull(username);
    });

  });

  it('should log into account', function() {
    var submitButton = '#login-password-form button[type="submit"]';

    // Click the login button
    casper.then(function(){
      casper.click('.login');
      casper.waitForSelector('#login-register');
    });

    // Fill out the login form
    casper.then(function() {
      casper.fillSelectors('#login-password-form', {
        '#username': config.user.username,
        '#password': config.user.password
      }, false);
      casper.waitForSelector(submitButton);
    });

    // Click the "sign in" button
    casper.then(function() {
      casper.click(submitButton);
      casper.waitForSelector('.profile.dropdown');
    });

    // Verify that account was created and user is logged in
    casper.then(function(){
      var username = casper.evaluate(function() {
        return window.cache.currentUser.username;
      });
      assert.equal(username, config.user.username);
      casper.click('a.logout');
    });

  });

});

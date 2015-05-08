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
  casper.start(system.env.TEST_ROOT + '/tasks', function afterStart() {
    this.options = {
      waitTimeout: 1000 * 15
    };
    this.on('remote.message', function(message) {
      this.log('browser console.log ==> ' + message);
    });
  }).viewport(1000,1000).userAgent('Mozilla/5.0');
});

describe('User actions', function() {

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

  it('should log in from task page', function() {
    var submitButton = '#login-password-form button[type="submit"]';

    // Wait for tasks to load
    casper.then(function() {
      casper.waitForSelector('#browse-list');
    });

    // Click task title
    casper.then(function() {
      casper.capture('temp.png');
      casper.click('.task-box a');
      casper.waitForSelector('#volunteer');
    });

    // Click volunteer button
    casper.then(function() {
      casper.click('#volunteer');
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
      casper.waitForSelector('#submit');
    });

  });

  it('should volunteer after logging in', function() {

    // Click "I agree" to volunteer
    casper.then(function() {
      casper.click('#submit');
      casper.waitUntilVisible('.volunteer-true');
    });

    // Get the task data from the API and confirm volunteer is set
    casper.then(function() {
      var user = casper.evaluate(function() {
            return window.cache.currentUser.id;
          }),
          task = casper.getCurrentUrl().split('/').pop(),
          data = casper.evaluate(function(url, userId) {
            return JSON.parse(__utils__.sendAJAX(url, 'GET', null, false));
          }, {
            url: system.env.TEST_ROOT + '/api/task/' + task,
            userId: user
          });
      assert(data.volunteers[0].userId, user);
    });

  });

});

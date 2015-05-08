var config = require('./config');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var casper_chai = require('casper-chai');
chai.use(casper_chai);

// access environment vars
var system = require('system');

/**
 *
 * User action tests
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

describe('Task actions', function() {

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
      casper.waitForSelector('a.add-opportunity');
    });

  });

  it('should create new task', function() {

    // Click +opportunity
    casper.then(function() {
      casper.click('.add-opportunity');
      casper.waitForSelector('#task-form');
    });

    // Agree to terms
    casper.then(function() {
      casper.click('#task-responsibilities');
      casper.click('#wizard-forward-button');
      casper.waitForSelector('#task-title');
    });

    // Fill out title
    casper.then(function() {
      casper.fillSelectors('#task-form', {
        '#task-title': config.task.title
      });
      casper.click('#wizard-forward-button');
      casper.waitForSelector('#s2id_people');
    }, false);

    // Select number of people for task and a new tag to task
    casper.then(function() {
      casper.fillSelectors('#task-form', {
        '#people': config.task.people.id
      }, false);
      casper.click('#wizard-forward-button');
      casper.click('#wizard-forward-button');
    });

    // Fill out description
    casper.then(function() {
      casper.fillSelectors('#task-form', {
        '#task-description': config.task.description
      });
      casper.waitUntilVisible('#wizard-create-button');
    });

    // Click "Create"
    casper.then(function() {
      casper.click('#wizard-create-button');
      casper.waitForSelector('.edit-task-section');
    });

    // Verify new task
    casper.then(function() {
      var title = casper.fetchText('.edit-task-section h1'),
          description = casper.fetchText('.edit-task-section .task-show-description').trim(),
          people = casper.fetchText('#task-people-empty+li').trim();
      assert.equal(config.task.title, title);
      assert.equal(config.task.description, description);
      assert.equal(config.task.people.name, people);
    });
  });

});

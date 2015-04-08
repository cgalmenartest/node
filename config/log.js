console.log('Loading... ', __filename);
var winston = require('winston');
/**
* Logger configuration
*
* Configure the log level for your app, as well as the transport
* (Underneath the covers, Sails uses Winston for logging, which
* allows for some pretty neat custom transports/adapters for log messages)
*
* For more information on the Sails logger, check out:
* http://sailsjs.org/#documentation
*/
/*
Winston log levels are flipped from sails log levels, so using the log_level array makes it behave as expected in the sails documentation
*/

/**************************************
/**************************************
 ***
 ***      OVER RIDE INSTRUCTIONS
 ***
 **************************************
/**************************************/

/*
to customize your logging settings add something like the following to the portion of your local.js file ABOVE where module.exports = { begins

  var winston = require('winston');

var log_levels = {
  silent: 6,
  error: 5,
  warn: 4,
  debug: 3,
  info: 2,
  verbose: 1,
  silly: 0
};

var transports = [
    new (winston.transports.File)(
      {
        level: 'verbose',
        name: 'written.log',
        silent: false,
        colorize: false,
        timestamp: true,
        filename: "application-test.log",
        maxsize: 500000,
        maxFiles: 5,
        json: false,
        handleExceptions: false
      }
    ),
    new (winston.transports.Console)(
      {
        level: 'silly',
        name: 'console.log',
        silent: false,
        colorize: true,
        timestamp: true,
        json: false,
        handleExceptions: false
      }
    )
  ];

var logger = new (winston.Logger)({
  exitOnError: false,
  transports: transports,
  levels: log_levels
});

 ************************************
 ************************************
 ************************************

 AND THEN add a log section inside the module exports object
    this level needs to be equal to or greater than the level you want to capture in the winston logs

 log: {
    level: 'verbose',
    colors: false, // To get clean logs without prefixes or color codings
    custom: logger
  }
*/

var winston = require('winston');

var log_levels = {
  silent: 6,
  error: 5,
  warn: 4,
  debug: 3,
  info: 2,
  verbose: 1,
  silly: 0
};

var transports = [
    new (winston.transports.Console)(
      /*This Transport is required to get console output, regardless of sails log level
      *  output will be the lesser of sails log level and the transport level if they aren't equal
      *  accordingly, transport log level shoul always be equal or lower than sails log level for readability's sake
      */
      {
        level: 'debug',
        name: 'console.log',
        silent: false,
        colorize: true,
        timestamp: true,
        json: false,
        handleExceptions: false
      }
    )
  ];

var logger = new (winston.Logger)({
  exitOnError: false,
  transports: transports,
  levels: log_levels
});

module.exports.log = {
  level: 'debug',
  colors: false, // To get clean logs without prefixes or color codings
  custom: logger
};
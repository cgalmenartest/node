var async = require("async");
var fs = require("fs");
var Sails = require('sails').constructor;
var sailsApp = new Sails();

var dbTools = require('./lib/dbTools');
var sailsModel = require('./lib/modelTools');
var dataDir = __dirname + '/demo-data'

dbTools.checkTableSetup('midas_user')
.then(function() {
  sailsApp.lift(
    {
      log: {
        level: 'error'
      }
    },
    function (err, liftedApp) {
      if (err) {
        return console.log("Error occurred lifting Sails app: ", err);
      }
      console.log('config connections:', liftedApp.config.connections)
      console.log('config models.connection:', liftedApp.config.models.connection)

      sailsModel.importFromFile(sails.models['user'], dataDir + '/users.csv')
      .then(function(users) {
        console.log('new users created: ', users);
        return sailsModel.importFromFile(sails.models['task'], dataDir + '/tasks.csv')
      })
      .then(function(tasks) {
        console.log('new tasks created: ', tasks);
        console.log("Sails app lifted successfully in port", sailsApp.config.port);
        // Note that liftedApp === sailsApp
      })
      .catch(function(err) {
        console.log('err: ', err)
      });
    }
  )
});

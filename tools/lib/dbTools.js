var fs = require('fs');
var pg = require('pg');

// load db config file
try {
  var config = require('../../config/connections').connections.postgresql;
  var pgConfig = {
    user: config.user,
    password: config.password,
    database: config.database,
    host: config.host,
    port: 5432
  };
} catch(e) {
  console.log("Please create a config/database.json file with your postgresql information, err: ", e);
  process.exit(1);
}

module.exports = {
  importTagsFromFile: function(tagFile, tagType, done) {
    console.log("params:", tagFile, tagType)
    var tags = [];
    // load tags from file
    if (fs.existsSync(tagFile)) {
      tags = fs.readFileSync(tagFile).toString().split("\n");
    } else {
      throw new Error("File Not Found: '" + tagFile + "'");
    }


    pg.connect(pgConfig, function (err, client, pg_done) {
      if (err) {
        console.log('attempted: '+config.host+", database: '"+config.database+"'")
        console.log('Failed to connect with error: ', err );
        done(err);
      }
      client.on('drain', function() {
        client.end.bind(client);
        done();
      }); //disconnect client when all queries are finished
      client.on('error', function(pg_error) {
        done(pg_error)
      });
      // loop over records in the file, creating a record for each
      var date = new Date();
      console.log(tagType, ': adding '+tags.length+' tags...')
      for (i in tags) {
        if (tags[i].length > 0) {
          var query_text = 'INSERT INTO tagEntity ("type","name","createdAt","updatedAt") SELECT $1, $2, $3, $4 WHERE NOT EXISTS (SELECT id FROM tagEntity WHERE "name" = $5 AND "type" = $6)';
          var query_data = [tagType, tags[i], date, date, tags[i], tagType]
          var insert = client.query({text: query_text, values: query_data});
        }
      }
    });
  }
}

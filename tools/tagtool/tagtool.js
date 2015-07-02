#! /usr/bin/env node

function help_and_quit(msg) {
  if(msg) {
    console.log("Error:\n    " + msg + "\n");
  }
  console.log("This is a tool for loading tags into the database in bulk.\n" +
              "\n" +
              "Usage:\n" +
              "    ./tagtools.js [type] [file]\n" +
              "\n" +
              "    type - The string type of tags to be loaded\n" +
              "    file - file containing a newline delimited list of tag values to be loaded\n");
  process.exit(1);
}

var fs = require('fs');
var pg = require('pg');

// load db config file
try {
  var config = require('../../config/local');
} catch(e) {
  help_and_quit("Please create a config/local.js file with your postgresql information");
}

var args = process.argv.slice(2);

if (args.length < 2) {
  help_and_quit();
}

var tagType = args[0];
var tagFile = args[1];

if (tagType.length === 0) {
  help_and_quit('Tag type must be provided.');
}

var tags = [];
// load tags from file
if (fs.existsSync(tagFile)) {
  tags = fs.readFileSync(tagFile).toString().split("\n");
}
else {
  help_and_quit('Failed to find tag file (' + tagFile + ')');
}

// open database
var client = new pg.Client({
  user: config.adapters.postgresql.user, 
  password: config.adapters.postgresql.password,
  database: config.adapters.postgresql.database,
  host: config.adapters.postgresql.host,
  port: 5432
});

client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished

client.connect(function (err) {
  if (err) {
    help_and_quit('Failed to connect to the database (' + err + ')');
  }
  // loop over records in the file, creating a record for each
  var date = new Date();
  for (i in tags) {
    if (tags[i].length > 0) {
      var insert = client.query({
          text: 'INSERT INTO tagEntity ("type","name","createdAt","updatedAt") SELECT $1, $2, $3, $4 WHERE NOT EXISTS (SELECT id FROM tagEntity WHERE "name" = $5 AND "type" = $6)',
          values: [tagType, tags[i], date, date, tags[i], tagType]
        }, function(err, result) {
          if (err) {
            console.log('Failed to add tag to the database: ' + tags[i] + ' with error '  + err);
            return 1;
          }
      });
    }
  }
});

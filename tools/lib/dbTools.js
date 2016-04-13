var fs = require('fs');
var pgp = require('pg-promise')();

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
  var db = pgp(pgConfig);
} catch(e) {
  console.log("Please create postgresql configuration in config/connections file, err: ", e);
  process.exit(1);
}

module.exports = {
  end: function() {
    pgp.end();
  },
  checkTagTableSetup: function() {
    // check that the tag table is set up, fail and close db connection if not
    promise = this.hasTable('tagentity')
    .catch(function(err) {
      console.log("\n",err.message);
      if (err.message == 'database "midas" does not exist') {
        console.log(" You can create the database with: createdb midas\n");
      }
      reject(err);
    })
    .then(function(hasTable) {
      if (!hasTable) {
        console.log("\n Database 'midas' needs to have 'tagentity' table.\n Maybe you need to run: npm run migrate\n" )
        pgp.end();
        reject(new Error("Missing table: tagentity"));
      }
    });
    return promise;
  },
  hasTable: function(tableName) {
    var query = "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' \
                    AND table_name = $1)";
    return db.any(query, tableName)
      .then(function (data) {
        return data[0].exists
      })
  },
  importTagsFromFile: function(tagFile, tagType) {
    console.log("importing:", tagFile)
    var tags = [];
    // load tags from file
    if (fs.existsSync(tagFile)) {
      tags = fs.readFileSync(tagFile).toString().split("\n");
    } else {
      throw new Error("File Not Found: '" + tagFile + "'");
    }

    var date = new Date();

    // returns a promise
    return db.tx(function (t) {
      tagQueries = [];
      var query_text = 'INSERT INTO tagEntity ("type","name","createdAt","updatedAt") SELECT $1, $2, $3, $4 WHERE NOT EXISTS (SELECT id FROM tagEntity WHERE "name" = $5 AND "type" = $6)';
      for (i in tags) {
        if (tags[i].length > 0) {
          console.log('>', tags[i]);
          var query_data = [tagType, tags[i], date, date, tags[i], tagType];
          var query = t.none(query_text, query_data);
          tagQueries.push(query);
        }
      }
      return t.batch(tagQueries);
    })
  }
}

/**
 * Source definition for searching a field in a model
 *
 * @module    :: Source
 * @description :: Search Models for a term
 */
var async = require('async');
var _ = require('underscore');

module.exports = {
  /**
   * Query the source for a term, given a config
   * Model requires in the configuration:
   *  - target : the model to be queried
   *  - fields : the fields in order to be queried
   */
  query: function (term, config, cb) {
    var model = sails.models[config.target.toLowerCase()];
    var results = [];

    var doIt = function (field, done) {
      // Set up the where clause
      var where = { where: { like: { } }, limit: field.limit || 10 };
      // Add the search term to find the field
      where.where.like[field['name']] = term;
      // Extend with configuration options
      _.extend(where.where, field.where || {});
      // Query the model for matching entries
      model.find(where, function (err, models) {
        for (var i = 0; i < models.length; i++) {
          var result = { value: models[i][field['name']],
                          id: models[i].id,
                          field: field['name'],
                          target: config.target.toLowerCase()
                        }
          // If search by multiple fields, include the values
          // for the other fields (eg, if the match is in the
          // username of a user profile, also return the name)
          for (var j = 0; j < config.fields.length; j++) {
            result[config.fields[j].name] = models[i][config.fields[j].name];
          }
          results.push( result );
        }
        return done(err);
      });
    };

    // Search for each field and add to the results array
    async.each(config.fields, doIt, function (err) {
      if (err) { return cb(err, null); }
      // performance optimization; only dedup if multiple fields are queried
      if (config.fields.length > 1) {
        // dedup results for multiple matches
        var out = [];
        for (var i = 0; i < results.length; i++) {
          var found = false;
          for (var j = 0; j < out.length; j++) {
            if (out[j].id === results[i].id) {
              found = true;
              break;
            }
          }
          if (!found) {
            out.push(results[i]);
          }
        }
        return cb(null, out);
      }
      return cb(null, results);
    });
  }
}
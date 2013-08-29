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
          results.push( { value: models[i][field['name']],
                          id: models[i].id,
                          field: field['name'],
                          target: config.target.toLowerCase()
                        } );
        }
        return done(err);
      });
    };

    // Search for each field and add to the results array
    async.each(config.fields, doIt, function (err) {
      if (err) { return cb(err, null); }
      return cb(null, results);
    });
  }
}
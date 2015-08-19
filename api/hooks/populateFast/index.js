/*
 * A faster way to populate many-to-many associations
 *
 * Optionally overrides Model.populate() with a faster query
 * for manty-to-many associations. This only works on SQL-based adapters.
 *
 * To use, set `populateFast: true` on your connection's configuration:
 *
 * `config/connections.js:`
 * module.exports = {
 *   postgresql: {
 *     adapter: 'sails-postgresql',
 *     populateFast: true
 *   }
 * };
 *
 */

var Deferred = require('sails/node_modules/waterline/lib/waterline/query/deferred'),
    normalize = require('sails/node_modules/waterline/lib/waterline/utils/normalize');

// Format from https://github.com/rhpwn/sails-hook-populate-fields
module.exports = function(sails) {

  function patch() {
    Deferred.prototype.populateOriginal = Deferred.prototype.populate;
    Deferred.prototype.execOriginal = Deferred.prototype.exec;
    Deferred.prototype.exec = exec;
    Deferred.prototype.populate = populateFast;
  }

  return {
    initialize: function(done) {
      var eventsToWaitFor = [];
      if (sails.hooks.orm) {
        eventsToWaitFor.push('hook:orm:loaded');
      }
      if (sails.hooks.pubsub) {
        eventsToWaitFor.push('hook:pubsub:loaded');
      }
      sails.after(eventsToWaitFor, function() {
        patch();
        done();
      });
    }
  };
};

function populateFast(attr) {
  var Model = this._context,
      schema = Model._attributes[attr],
      connection = Model.adapter.dictionary.identity,
      connectionConfig = Model.connections[connection].config;

  if (!connectionConfig.populateFast || !schema || !schema.dominant) {
    return this.populateOriginal.apply(this, arguments);
  }

  this._populateFast = attr;
  return this;
}

function exec(cb) {
  if (!this._populateFast) return this.execOriginal.apply(this, arguments);

  if (!cb) {
    console.log(new Error('Error: No Callback supplied, you must define a callback.').message);
    return;
  }

  // Normalize callback/switchback
  this._cb = normalize.callback(cb);

  // Set up arguments + callback
  var args = [this._criteria, populate.bind(this)];
  if (this._values) args.splice(1, 0, this._values);

  // Pass control to the adapter with the appropriate arguments.
  this._method.apply(this._context, args);
}

function populate(err, models) {
  if (err) return this._cb(err);
  var Model = this._context,
      attr = this._populateFast,
      type = Model.identity,
      done = this._cb,
      assoc = _.findWhere(Model.associations, { alias: attr }),
      table = Model.adapter.collection,
      collection = assoc.collection,
      via = assoc.via,
      tagKey = collection + '_' + via, // e.g. tagentity
      typeKey = type + '_' + attr, // e.g. tasks
      joinTable = [tagKey, typeKey].sort().join('__'),
      query;

  query = 'SELECT tag.*, ' + table + '.id AS _model FROM ' + collection + ' tag ' +
    'INNER JOIN ' + joinTable + ' t ON tag.id = t.' + tagKey + ' ' +
    'INNER JOIN ' + table + ' ON ' + table + '.id = t.' + typeKey;

  Model.query(query, function(err, result) {
    if (err) return done(err);
    var tags = result.rows,
        groups = _.groupBy(tags, '_model'),
        match = function (model) {
          if (typeof model.toObject === 'function') model = model.toObject();
          model[attr] = groups[model.id];
          return model;
        };
    models = models.length ? models.map(match) : match(models);
    return done(null, models);
  });
}

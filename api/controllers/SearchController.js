/**
 * SearchController
 *
 * @module		:: Controller
 * @description	:: Performs search functions for the front end
 */

var _ = require('underscore');
var async = require('async');
var projUtil = require('../services/utils/project');
var taskUtil = require('../services/utils/task');
var tagUtil = require('../services/utils/tag');

function search (target, req, res) {
  // Store the userid for use later
  var userId = null;
  if (req.user) {
    userId = req.user[0].id;
  }
  // make the query well formed
  var q = req.body;
  q.items = q.items || [];
  q.tags = q.tags || [];

  // store the result data
  var items = [];
  var itemIds = q.items;
  var itemIdsAuthorized = [];

  // For each tag, find items associated with it
  var processTag = function (tagId, cb) {
    var where = {}
    var t = target.substr(0, target.length - 1);
    where[t + 'Id'] = { not: null };
    Tag.find()
    .where({ tagId: tagId })
    .where(where)
    .exec(function (err, tags) {
      for (var i in tags) {
        if (_.indexOf(itemIds, tags[i][t + 'Id']) == -1) {
          itemIds.push(tags[i][t + 'Id']);
        }
      }
      cb(err);
    });
  };

  var checkFn = projUtil.authorized;
  if (target == 'tasks') {
    checkFn = taskUtil.authorized;
  }
  // Get the item by checking if we're authorized to view it
  var check = function (id, cb) {
    checkFn(id, userId, function (err, item) {
      if (!err && item) {
        items.push(item);
        itemIdsAuthorized.push(item.id);
      }
      cb(err);
    });
  };

  // Get each of the items with given tags
  async.each(q.tags, processTag, function (err) {
    if (err) { return res.send(400, { message: 'Error performing query.'}); }
    // Get the details of each item
    async.each(itemIds, check, function (err) {
      if (err) { return res.send(400, { message: 'Error performing query.'}); }
      // Perform item specific processing
      // Get task metadata
      if (target == 'tasks') {
        taskUtil.findTasks({ id: itemIdsAuthorized }, function (err, items) {
          if (err) { return res.send(400, { message: 'Error performing query.', error: err }); }
          return res.send(items);
        });
        return;
      }
      // Get project metadata
      async.each(items, projUtil.addCounts, function (err) {
        if (err) { return res.send(400, { message: 'Error performing query.'}); }
        res.send(items);
      });
    });
  });
};

module.exports = {

  index: function (req, res) {
    if (!req.body) {
      return res.send(400, { message: 'Need data to query' });
    }
    if ((req.body.target == 'projects') || (req.body.target == 'tasks')) {
      return search(req.body.target, req, res);
    }
    return res.send([]);
  },

};

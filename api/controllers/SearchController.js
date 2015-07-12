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


function taskProjectSearch(target, req, res) {
  //builds an array of task/project ids where search terms were found
  //   returns task / project(+counts) objects which are rendered by the calling page as cards
  //   search terms are ANDed
  //      if you put in foo and bar, only results with BOTH will return

  var results   = [];

  var modelProxy = null;
  if (target === 'tasks') {
    modelProxy = Task;
    modelWord = 'task';
  } else {
    modelProxy = Project;
    modelWord = 'project';
  }

  // make the query well formed
  var q = req.body;
  q.freeText = q.freeText || [];

  var freeTextSearch = function (search,cb) {
    //this is a temp solution
    // should be revisited once we are on sails 10
    // we are waiting for support of contains in an or-pair fragment in waterline

    var titleSqlFrag = '',
        descSqlFrag = '';

    _.each(search,function(term){
      if ( titleSqlFrag === "" ){
        titleSqlFrag = " title ilike '%"+term+"%'";
        descSqlFrag  = " description ilike '%"+term+"%'";
      } else {
        titleSqlFrag = titleSqlFrag+" and title ilike '%"+term+"%'";
        descSqlFrag = descSqlFrag+" and description ilike '%"+term+"%'";
      }
    });

    // TODO: needs escaping to prevent SQL injection
    modelProxy.query("select distinct id from "+modelWord+" where "+titleSqlFrag+" or "+descSqlFrag+" order by id asc",function(err,data){
      if ( _.isNull(data) ) { cb(); }
      var temp = _.map(data.rows,function(item,key){
        return item.id;
      });
      results.push.apply(results,temp);
      cb();
    });
  };

  var tagSearch = function (search, cb) {
    var query = search.map(function(term) {
          return { name: { 'contains': term } };
        });
    TagEntity.find(query).populate(target).exec(function(err, tags) {
      if (err) return cb(err);
      var ids = _(tags).chain()
            .pluck(target)
            .map(function(items) {
              return _.pluck(items, 'id');
            })
            .flatten()
            .unique()
            .value();
      results = results.concat(ids);
      cb();
    });
  };

  async.series([
    function(callback){
      freeTextSearch(q.freeText,function(err){
        //we're don't care about the callback behavior here, so discard it
        callback(null,null);
      });
    }, function(callback) {
      tagSearch(q.freeText,function(err){
        //we're don't care about the callback behavior here, so discard it
        callback(null,null);
      });
    }
  ], function(err,trash) {
    var items = [];

    //de-dupe
    results = _.uniq(results);

    if ( target == 'tasks' ){
      taskUtil.findTasks({id:results}, function (err, items) {
        if ( _.isNull(items) ){
          res.send([]);
        } else {
          res.send(items);
        }
      });
    } else {
      //this each is required so we can add the counts which are need for project cards only
      async.each(results, function(id,fcb){
        Project.findOneById(id,function(err,proj){
          projUtil.addCounts(proj, function (err) {
            items.push(proj);
            fcb();
          });
        });
      }, function(err) {
        if (err) return res.serverError(err);
        if ( _.isNull(items) ){
          res.send([]);
        } else {
          res.send(items);
        }
      });
    }
  });
}

function profileSearch (req, res) {
  if (!req.body) {
    return res.send(400, {message: 'Need data to query'});
  }
  var q = req.body;
  var searchTerms = q.freeText || [];

  // Same problem as taskProjectSearch above. Searching for multiple "contains" queries on
  // a column doesn't seem to be supported by Sails ORM. Fall back to SQL for now.
  // TODO: needs escaping to prevent SQL injection
  var selectClause =
    "SELECT DISTINCT midas_user.id FROM midas_user " +
        "LEFT OUTER JOIN tagentity_users__user_tags " +
    "ON tagentity_users__user_tags.user_tags = midas_user.id " +
        "LEFT JOIN tagentity " +
    "ON tagentity_users__user_tags.tagentity_users = tagentity.id";

  var whereClause = searchTerms.map(function (term) {
    return "(midas_user.name ILIKE '%" + term + "%' OR midas_user.title ILIKE '%" + term + "%' or tagentity.name ILIKE '%" + term + "%')";
  }).join(" AND ");

  var query = selectClause + " WHERE " + whereClause + " ORDER BY midas_user.id ASC";

  User.query(query, function (err, data) {
    var userIds = _.map(data.rows, function (item) { return item.id; });
    // now that we have a list of ID's, we can use the ORM to flesh out the objects
    User.find({id: userIds}).populate('tags').exec(function (err, users) {
      if (err) { return res.serverError(err); }
      users = _.reject(users, function (u) { return u.disabled; });
      _.each(users, function (user) {
        delete user.auths;
        delete user.passwordAttempts;
        // de-normalize these two special tags, delete the rest
        user.location = _.findWhere(user.tags, {type: 'location'});
        user.agency = _.findWhere(user.tags, {type: 'agency'});
        delete user.tags;
      });
      return res.send(users);
    });
  });
}


module.exports = {

  index: function (req, res) {
    if (!req.body) {
      return res.send(400, { message: 'Need data to query' });
    }
    if ((req.body.target == 'projects') || (req.body.target == 'tasks')) {
      return taskProjectSearch(req.body.target, req, res);
    } else if (req.body.target == 'profiles') {
      return profileSearch(req, res);
    }
    return res.send([]);
  },

};

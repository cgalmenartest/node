var Sails = require('sails'),
    _ = require('underscore'),
    async = require('async');


var opts = {
  connections: {
    postgresql: { softDelete: false }
  }
};

Sails.lift(opts, function(err, sails) {
  if (err) return console.error(err);

  var tagsToRename = {
    'Part Time': 'One time',
    'Full Time': 'On going',
    '1 Week': '1 week',
    '1 Month': '1 month',
    'A Few Months': '3 months',
    '1 - 3 hours': 'Up to 2 hours',
    '9 - 24 hours': '8 - 16 hours'
  };

  var newTagNamesToAdd = [
    { type: 'task-length', name: '6 months' },
    { type: 'task-time-estimate', name: '2 - 4 hours' },
    { type: 'task-time-estimate', name: '16 - 24 hours' }
  ];

  var tagNamesToMigrate = {
    '20% Time': 'On going',
    '1 Day': '1 week',
    '1 - 3 Days': '1 week',
    'longer than 40 hours': '24 - 40 hours'
  };

  function renameTags (cb) {
    _.keys(tagsToRename).forEach(function(oldTag) {
      var newTag = tagsToRename[oldTag];

      console.log('Renaming tags "' + oldTag + '" to "' + newTag + '"');

      TagEntity.findOne({name: oldTag})
      .exec(function (err, tagEntity) {
        if (err) return cb(err);

        tagEntity.name = newTag;
        tagEntity.save(function (err, newModel) {
          if (err) return cb(err);
        });
      });
    });
    cb(null);
  }

  function addTags (cb) {
    _.each(newTagNamesToAdd, function (newTagName) {
      var type = newTagName.type;
      var name = newTagName.name;
      var newTag = { type: type, name: name };

      console.log('Adding new tag "' + name + '" of type "' + type + '"');

      TagEntity.create(newTag).exec(function (err, newModel){
        if (err) { return cb(err); }
      });
    });
    cb(null);
  }

  function migrateTags (cb) {
    _.keys(tagNamesToMigrate).forEach(function (oldTag) {
      var newTag = tagNamesToMigrate[oldTag];

      console.log('Migrating tags "' + oldTag + '" to "' + newTag + '"');
      TagEntity.findOne({ name: newTag })
      .exec(function (err, newTagEntity){
        if (err) { return cb(err); }

        // nested so that we have easy access to the new and old tags
        TagEntity.findOne({ name: oldTag })
        .populate('users').populate('tasks').populate('projects')
        .exec(function (err, oldTagEntity) {
          if (err) { return cb(err); }
          if (!oldTagEntity) { return cb(null) }

          if (oldTagEntity.users.length != 0) {
            oldTagEntity.users.forEach(function (user) {
              migrateTagsOnModelAndDeleteOld(user, newTagEntity, oldTagEntity)
            });
          }

          if (oldTagEntity.tasks.length != 0) {
            oldTagEntity.tasks.forEach(function (task) {
              migrateTagsOnModelAndDeleteOld(task, newTagEntity, oldTagEntity)
            });
          }

          if (oldTagEntity.projects.length != 0) {
            oldTagEntity.projects.forEach(function (project) {
              migrateTagsOnModelAndDeleteOld(project, newTagEntity, oldTagEntity)
            });
          }

        });
      });
    });
    cb(null);
  }

  function migrateTagsOnModelAndDeleteOld (model, newTag, oldTag) {
    model.tags.add(newTag.id);
    model.tags.remove(oldTag.id);
    model.save(function (err) {
      if (err) return cb(err);
      TagEntity.destroy({ id: oldTag.id }).exec(function (err, d) {
        if (err) return cb(err);
      });
    });
  }

  async.series([renameTags, addTags, migrateTags], function (err, result) {
    if (err) return err;

    console.log('Migration done');
  })

});

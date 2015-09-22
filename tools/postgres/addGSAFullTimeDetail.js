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

  function addDetailTag (cb) {
    var agencyName = 'General Services Administration (GSA)';
    var fullTimeTag = {
      type: 'task-time-required',
      name: 'Full Time Detail',
      data: {
        agency: {
          name: 'General Services Administration (GSA)'
        }
      }
    };


    TagEntity.findOne({name: fullTimeTag.name})
    .exec(function(err, tagEntity) {
      if (err) return cb(err);
      if (tagEntity) {
        console.log('Full time detail tag already exists');
        return ;
      }

      TagEntity.findOne({ name: agencyName })
      .exec(function(err, tagEntity) {
        if (err) return cb(err);
        fullTimeTag.data.agency.id = tagEntity.id;

        TagEntity.create(fullTimeTag).exec(function (err, newModel){
          if (err) { return cb(err); }
          cb(null);
        });

      });
    });
    cb(null);
  }

  addDetailTag(function(err) {
    if (err) {
      console.error('Detail tag addition failed');
      console.error('Error:', err);
      return;
    }
    console.log('Detail tag addition successful');
  });
});

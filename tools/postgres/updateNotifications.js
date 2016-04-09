var Sails = require('sails'),
    async = require('async'),
    request = require('request');

Sails.lift({
  connections: {
    postgresql: {
      softDelete: false
    }
  }
}, function(err, sails) {
  if (err) return console.error(err);

  Notification.find({}).exec(function(err, notifications) {
    if (err) return console.error(err);
    async.each(notifications, updateNotification, function(err) {
      if (err) console.error(err);
      console.log('Shutting down server');
      Sails.lower();
    });
  });

  function updateNotification(n, done) {
    if (n.model) return done();

    var Model = sails.models[n.callerType.toLowerCase()],
        id = n.callerId;

    if (n.action === 'taskCommentAdded') {

      n.action = 'comment.create.owner';
      Model.findOne({ id: id }).exec(function(err, model) {
        if (err) return done(err);
        n.model = model;
        n.save(function(err, model) {
          if (err) return done(err);
          done();
        });
      });

    } else if (n.action === 'taskAssigned') {

      n.action = 'task.update.assigned';
      Model.findOne({ id: id }).exec(function(err, model) {
        if (err) return done(err);
        n.model = model;
        n.save(function(err, model) {
          if (err) return done(err);
          done();
        });
      });

    } else if (n.action === 'taskCreated') {

      n.action = 'task.create.thanks';
      Model.findOne({ id: id }).exec(function(err, model) {
        if (err) return done(err);
        n.model = model;
        n.save(function(err, model) {
          if (err) return done(err);
          done();
        });
      });

    } else if (n.action === 'userPasswordReset') {

      n.action = 'userpasswordreset.create.token';
      Model.findOne({ id: id }).exec(function(err, model) {
        if (err) return done(err);
        n.model = model;
        n.save(function(err, model) {
          if (err) return done(err);
          done();
        });
      });

    } else if (n.action === 'welcomeUser') {

      n.action = 'user.create.welcome';
      Model.findOne({ id: id }).exec(function(err, model) {
        if (err) return done(err);
        n.model = model;
        n.save(function(err, model) {
          if (err) return done(err);
          done();
        });
      });

    } else if (n.action === 'projectCommentAdded') {

      n.action = 'comment.create.owner';
      Model.findOne({ id: id }).exec(function(err, model) {
        if (err) return done(err);
        n.model = model;
        n.save(function(err, model) {
          if (err) return done(err);
          done();
        });
      });

    } else if (n.action === 'taskVolunteerAdded') {
      n.action = 'volunteer.create.thanks';
      userId = JSON.parse(n.localParams).fields.volunteerId;
      Model = sails.models.volunteer;
      Model.findOne({ userId: userId, taskId: id }).exec(function(err, model) {
        if (err) return done(err);
        n.model = model;
        n.save(function(err, model) {
          if (err) return done(err);
          done();
        });
      });

    } else if (n.action === 'taskVolunteerRemoved') {
      n.action = 'volunteer.destroy.decline';
      userId = JSON.parse(n.localParams).fields.volunteerId;
      Model = sails.models.volunteer;
      Model.findOne({ userId: userId, taskId: id }).exec(function(err, model) {
        if (err) return done(err);
        n.model = model;
        n.save(function(err, model) {
          if (err) return done(err);
          done();
        });
      });

    } else {
      return done();
    }

  }
});

var badgeDescriptions = {
  // should be able to follow "You are awared this badge because you "
  // for email notifications
  'newcomer': 'have completed your first task.',
  'maker': 'have completed three tasks.',
  'game changer': 'have completed five tasks.',
  'disruptor': 'have completed ten tasks.',
  'partner': 'have completed fifteen tasks.',
  'local': 'have completed 2 tasks for one agency',
  'explorer': 'have completed a task for your second agency',
  'connector': 'have completed a task for your third agency',
  'mentor': 'have created your first ongoing task',
  'instigator': 'have created your first one-time task',
  'team builder': 'have accepted at least four people on a task'
};

module.exports = {

  attributes: {

    user: {
      model: 'user'
    },

    task: {
      model: 'task'
    },

    // type of the badge
    type: 'string',

    // create a notification or not
    silent: 'boolean',

    getDescription: function () {
      return badgeDescriptions[this.type];
    }

  },

  beforeCreate: function (values, done) {
    var b = { type: values.type, user: values.user };
    Badge.findOne(b).exec(function (err, found) {
      if (err) return done(err);
      if (found) {
        done({ 'error': 'duplicate entry' });
      }
      else {
        done();
      }
    });
  },
  afterCreate: function(model, done) {
    model.silent = true;
    if (model.silent === true) return done();

    User.find({ id: model.user }).exec(function(err, users) {
      if (err) return done(err);

      var data = {
        user: users[0],
        badge: {
          type: model.type,
          description: badgeDescriptions[model.type]
        }
      };

      Notification.create({
        action: 'badge.create.owner',
        model: data
      }, done);
    });
  }
};

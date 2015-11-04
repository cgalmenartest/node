var badgeDescriptions = {
  // should be able to follow "You are awared this badge because you "
  // for email notifications

  // <type: description>
  'newcomer': 'have completed your first task.',
  'maker': 'have completed three tasks.',
  'game changer': 'have completed five tasks.',
  'disruptor': 'have completed ten tasks.',
  'partner': 'have completed fifteen tasks.',
  'mentor': 'have created your first ongoing task',
  'instigator': 'have created your first one-time task',
  'team builder': 'have accepted at least four people on a task',

  // the badges below have yet to be implemented
  'local': 'have completed 2 tasks for one agency',
  'explorer': 'have completed a task for your second agency',
  'connector': 'have completed a task for your third agency',
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

  // make sure each users has no more than one badge of each type
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
  },
  awardForTaskCompletion: function(task, user) {
    var completedAwards = {
          1: 'newcomer',
          3: 'maker',
          5: 'game changer',
          10: 'disruptor',
          15: 'partner'
        };

    if (_.findKey(completedAwards, user.completedTasks)) {
      var b = {
        type: completedAwards[user.completedTasks],
        user: user.id,
        task: task.id
      };
      Badge.findOrCreate(b, b, function(err, badge){
        if (err) return sails.log.error(err);
      });
    }
  },
  awardForTaskPublish: function (tasks, userId) {
    var badge   = { user: userId },
        counter = { ongoing: 0, oneTime: 0 },
        ongoingTaskId, oneTimeTaskId;

    tasks.forEach(function(t) {
      var taskType = _.where(t.tags, { type: 'task-time-required' });
      if (taskType[0] && taskType[0].name) {
        if (taskType[0].name === 'One time') {
          counter.oneTime++;
          oneTimeTaskId = t.id;
        }
        else if (taskType[0].name === 'Ongoing') {
          counter.ongoing++;
          ongoingTaskId = t.id;
        }
      }
    });

    if (counter.ongoing === 1) {
      badge.type = 'mentor';
      badge.task = ongoingTaskId;
    }
    else if (counter.oneTime === 1) {
      badge.type = 'instigator';
      badge.task = oneTimeTaskId;
    }

    Badge.findOrCreate(badge, badge).exec(function(err, b){
      if (err) return sails.log.error(err);
    });
  }
};

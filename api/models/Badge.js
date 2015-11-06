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
        done(new Error('Badge already exists'));
      }
      else {
        done();
      }
    });
  },
  // if the badge was not explicitly set to be silent
  // send out a notification to the user
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

  /**
   *
   * Determines if the completion of a task makes a
   * user eligible for a badge, and if so, awards
   * that badge to the user.
   * Takes an optional callback
   *
   * @param {object} task
   * @param {object} user
   * @param {function} done
   */
  awardForTaskCompletion: function(task, user, done) {
    var completedAwards = {
          1: 'newcomer',
          3: 'maker',
          5: 'game changer',
          10: 'disruptor',
          15: 'partner'
        };

    if (_.has(completedAwards, user.completedTasks)) {
      var badgeQuery = {
            type: completedAwards[user.completedTasks],
            user: user.id
          },
          badge = _.extend({}, badgeQuery, { task: task.id });

      Badge.findOrCreate(badgeQuery, badge, function(err, b){
        b = [b];
        // swallow a potential error (expected) that the badge
        // already exists
        if (err && err._e.toString().match('Badge already exists')) {
          err = null;
          b = [];
        }
        if (err) sails.log.error(err);
        if (done) return done(err, b);
        return;
      });
    } else {
      // result is empty array for no badges!
      if (done) done(null, []);
    }
  },
  /**
   *
   * Determines if the publishing of a task makes the
   * task creator eligible for a badge, and if so, awards
   * that badge to the user.
   * Takes an optional callback
   *
   * @param {tasks} task
   * @param {number} userId
   * @param {function} done
   */
  awardForTaskPublish: function (tasks, userId, done) {
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

    if (badge.type) {
      Badge.findOrCreate(badge, badge, function(err, b){
        b = [b];
        // swallow a potential error (expected) that the badge
        // already exists
        if (err && err._e.toString().match('Badge already exists')) {
          err = null;
          b = [];
        }
        if (err) sails.log.error(err);
        if (done) return done(err, b);
        return;
      });
    } else {
      // result is empty array for no badges!
      if (done) done(null, []);
    }
  }
};

/*---------------------
    :: Task
    -> model
---------------------*/
// TODO:  var exportUtils = require('../services/utils/export'),
//   moment = require('moment');

module.exports = {

  attributes: {
    // Current state of the task
    state: {
      type: 'STRING',
      defaultsTo: sails.config.taskState || 'draft',
    },
    // project id of the parent project
    projectId: 'INTEGER',
    // title of the task
    title: 'STRING',
    // description of the task
    description: 'STRING',
    completedBy: 'datetime',

    publishedAt: 'datetime',
    assignedAt: 'datetime',
    completedAt: 'datetime',
    submittedAt: 'datetime',

    owner: {
      columnName: 'userId',
      model: 'user'
    },
    volunteers: {
      collection: 'volunteer',
      via: 'task'
    },
    tags: {
      collection: 'tagEntity',
      via: 'tasks',
      dominant: true,
    },
    getOwnerId: function() {
      // if populate has been called, we'll have a user object
      // otherwise user is a number and is the id of the user
      var id = (typeof this.owner === 'object') ? this.owner.id : this.owner;
      return id;
    },
    isOpen: function() {
      if (_.indexOf(['open', 'public', 'assigned'], this.state) != -1) {
        return true;
      }
      return false;
    },

    isClosed: function() {
      if (_.indexOf(['closed', 'archived', 'completed'], this.state) != -1) {
        return true;
      }
      return false;
    },

    // if user is given and is the owner, sets isOwner
    // returns task if public or user has special access
    // returns null if task should not be accessed based on given user
    authorized: function(user) {
        task = this;
        task.isOwner = false;
        // check if current user is owner
        if (user && (task.getOwnerId() == user.id)) {
          task.isOwner = true;
          return task;   // owners always have access
        }
        // admins always have access
        if (user && user.isAdmin) return task;

        // all states except draft and submitted are public
        if ((task.state !== 'draft') && (task.state !== 'submitted')) {
          return task;
        }
        // Default denied: return no task
        return null;
    },

    // Called when a task is marked as complete, and increments
    // each participant's completedTasks counter
    volunteersCompleted: function() {
      var task = this;

      Volunteer.find({ taskId: task.id }).exec(function(err, volunteers) {
        if (err) return done(err);

        volunteers.forEach(function(vol) {
          User.findOne({ id: vol.userId }).exec(function(err, user) {
            user.taskCompleted(task);
          });
        });
      });
    },
  },

  //** CLASS METHODS **
  // finds task based on taskId
  // sets isOwner if user is given and is the owner
  // only returns task if public or user has special access
  authorized: function(taskId, user, done) {
    Task.findOneById(taskId)
    .populate('tags')
    .exec(function(err, task) {
      if (err) { return done(err) }
      if (!task) { return done('Error finding task.'); }
      result = task.authorized(user);
      return done(null, result);
    });
  },

  // returns an object with categories that each have a list of tasks
  // categories are all of the states, plus a separate category for
  // tasks that are open and have volunteers
  // assigned: [],
  // completed: [],
  // draft: [],
  // open: [],
  // submitted: []
  byCategory: function(page, limit, sort) {
    var page = page || 1,
      limit = limit || 1000,
      sort = sort || 'createdAt desc',
      output = {
        assigned: [],
        completed: [],
        draft: [],
        open: [],
        submitted: [],
      };

    var promise =
      Task.find({ state: [ 'draft', 'submitted', 'open', 'assigned', 'completed' ] })
          .populate('owner')
          .populate('volunteers')
          .sort(sort)
          .paginate({ page: page, limit: limit })
      .then(function(tasks) {
        _.forEach(tasks, function(t) {
          output[t.state].push(t);
        })
        return output;
      })
    return promise;
  },


  /* TODO Export
    exportFormat: {
      'project_id': 'projectId',
      'name': {field: 'title', filter: exportUtils.nullToEmptyString},
      'description': {field: 'description', filter: exportUtils.nullToEmptyString},
      'created_date': {field: 'createdAt', filter: exportUtils.excelDateFormat},
      'published_date': {field: 'publishedAt', filter: exportUtils.excelDateFormat},
      'assigned_date': {field: 'assignedAt', filter: exportUtils.excelDateFormat},
      'submitted_date': {field: 'submittedAt', filter: exportUtils.excelDateFormat},
      'creator_name': {field: 'creator_name', filter: exportUtils.nullToEmptyString},
      'signups': 'signups',
      'task_id': 'id',
      'task_state': 'state',
      'agency_name': {field: 'agency_name', filter: exportUtils.nullToEmptyString},
      'completion_date': {field: 'completedAt', filter: exportUtils.excelDateFormat},
    },
  */

  beforeUpdate: function(values, done) {
    Task.findOne({ id: values.id }).exec(function(err, task) {
      if (err) return done(err);

      // If task state hasn't changed, continue
      if (task && task.state === values.state) return done();

      // If new task or state has changed, update timestamps
      var action = false;
      switch (values.state) {
        case 'submitted':
          values.submittedAt = new Date();
          action = 'task.update.submitted';
          break;
        case 'open':
          values.publishedAt = new Date();
          action = 'task.update.opened';
          break;
        case 'assigned':
          values.assignedAt = new Date();
          action = 'task.update.assigned';
          break;
        case 'completed':
          values.completedAt = new Date();
          action = 'task.update.completed';
          task && task.volunteersCompleted();
          break;
      }

      // If no notification specified, continue
      if (!values.id || !action) return done();

      // Set up notification for updates (needs to happen here instead
      // of afterUpdate so we can compare to see if state changed)
      // TODO: Notification
      // Notification.create({
      //   action: action,
      //   model: values,
      // }, done);
      done();
    });
  },
  afterUpdate: function(task, done) {
    var self = this;
    var ownerId = task.owner;
    Task.find({ userId: ownerId }).populate('tags').exec(function(err, tasks) {
      if (err) return done(err);
      Badge.awardForTaskPublish(tasks, ownerId);
      done();
    });
  },
  beforeCreate: function(values, done) {
    sails.log.verbose("Task.beforeCreate")
      // If default state is not draft, we need to set dates
    this.beforeUpdate(values, done);
  },

  /*
   * After creation of the model, the
   */
  afterCreate: function(model, done) {
    sails.log.verbose("Task.afterCreate")

    if ('draft' === model.state) {

      if (model.createdAt === model.updatedAt) {
        // TODO: notification
        // Notification.create({
        //
        //   action: 'task.create.draft',
        //   model: model,
        //
        // }, done);
        done();
      } else {

        done();

      }

    } else {
      // TODO: notification
      // Notification.create({
      //
      //   action: 'task.create.thanks',
      //   model: model,
      //
      // }, done);
      done();
    }

  },

  // TODO: notifications
  // sendNotifications: function(i) {
  //   i = i || 0;
  //
  //   var now = new Date(new Date().toISOString().split('T')[0]),
  //     begin = moment(now).add(i, 'days').toDate(),
  //     end = moment(now).add(i + 1, 'days').toDate();
  //
  //   Task.find({
  //     completedBy: { '>=': begin, '<': end },
  //     state: 'assigned',
  //   }).exec(function(err, tasks) {
  //     if (err) return sails.log.error(err);
  //     var action = i ? 'task.due.soon' : 'task.due.today';
  //
  //     tasks.forEach(function(task) {
  //       var find = { action: action, callerId: task.id },
  //         model = { action: action, callerId: task.id, model: task };
  //       Notification.findOrCreate(find, model, function(err, notification) {
  //         if (err) sails.log.error(err);
  //         if (notification) sails.log.verbose('New notification', notification);
  //       });
  //     });
  //
  //   });
  // },

};

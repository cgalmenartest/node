/*---------------------
    :: Task
    -> model
---------------------*/
var noteUtils = require('../services/notifications/manager');

module.exports = {

  attributes: {
    // Current state of the task
    state: {
        type: 'STRING',
        defaultsTo: sails.config.taskState || 'open'
    },
    // user id of the task owner
    userId: 'INTEGER',
    // project id of the parent project
    projectId: 'INTEGER',
    // title of the task
    title: 'STRING',
    // description of the task
    description: 'STRING',

    publishedAt: 'datetime',
    assignedAt: 'datetime',
    completedAt: 'datetime',

    isOpen: function(){
        if ( _.indexOf(['open','public','assigned'],this.state) != -1 ){
            return true;
        }
        return false;
    },

    isClosed: function(){
        if ( _.indexOf(['closed','archived','completed'],this.state) != -1 ){
            return true;
        }
        return false;
    }
  },

  beforeUpdate: function(values, done) {
    Task.findOne({ id: values.id }).exec(function(err, task) {
      if (err) done(err);

      // If task state hasn't changed, continue
      if (task && task.state === values.state) return done();

      // If new task or state has changed, update timestamps
      var action = false;
      switch (values.state) {
        case 'open':
          values.publishedAt = new Date();
          break;
        case 'assigned':
          values.assignedAt = new Date();
          action = 'taskAssigned';
          break;
        case 'completed':
          values.completedAt = new Date();
          //Not implemented: action = 'taskCompleted';
          break;
      }

      // If no notification specified, continue
      if (!values.id || !action) return done();

      // Set up notification for updates (needs to happen here instead
      // of afterUpdate so we can compare to see if state changed)
      var params = {
        trigger: {
          callerType: 'Task',
          callerId: values.id,
          action: action
        },
        data: {
          audience: {
            'user': {
              fields: {
                taskId: values.id,
                userId: values.userId
              }
            }
          }
        }
      };
      noteUtils.notifier.notify(params, done);
    });
  },

  beforeCreate: function(values, done) {
    // If default state is not draft, we need to set dates
    this.beforeUpdate(values, done);
  },

  afterCreate: function(values, done) {
    var params = {
      trigger: {
        callerType: 'Task',
        callerId: values.id,
        action: 'taskCreated'
      },
      data: {
        audience: {
          'user': {
            fields: {
              taskId: values.id,
              userId: values.userId
            }
          }
        }
      }
    };
    noteUtils.notifier.notify(params, done);
  }

};

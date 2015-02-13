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
    switch(values.state) {
      case 'open':
        values.publishedAt = new Date();
        break;
      case 'assigned':
        values.assignedAt = new Date();
        break;
      case 'completed':
        values.completedAt = new Date();
        break;
    }
    done();
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

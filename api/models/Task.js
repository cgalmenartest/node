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

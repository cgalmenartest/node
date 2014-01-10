/**
 * Volunteer
 *
 * @module      :: Model
 * @description :: Stores volunteer information for tasks
 *
 */
 var noteUtils = require('../services/notifications/manager');
module.exports = {

  attributes: {

    // The task which a user volunteers for
    taskId: 'INTEGER',
    // the user that is volunteering
    userId: 'INTEGER'

  },

  // create notification after creating a volunteer
  afterCreate: function (values, cb){
    var params = {
      trigger: {
        callerType: 'Task',
        callerId: values.taskId,
        action: 'taskVolunteerAdded'
      },
      data: {
        audience: {
          'taskOwners': {
            fields: {
                taskId: values.taskId
            },
            strategy: {
              'contactTaskOwnersOnVolunteerEmail': {
                preflight: {
                  'taskVolunteerOwnerPrepare': {
                    fields: { volunteerId: values.userId }
                  }
                }
              }
            }
          }
        }
      }
    };

    noteUtils.notifier.notify(params, true, cb);
  }

};

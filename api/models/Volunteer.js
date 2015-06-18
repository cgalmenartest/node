/**
 * Volunteer
 *
 * @module      :: Model
 * @description :: Stores volunteer information for tasks
 *
 */
module.exports = {

  attributes: {

    // The task which a user volunteers for
    taskId: 'INTEGER',
    // the user that is volunteering
    userId: 'INTEGER'

  },

  // create notification after creating a volunteer
  afterCreate: function(model, done) {
    Notification.create({
      action: 'volunteer.create.thanks',
      model: model
    }, done);
  },

  afterDestroy: function(model, done) {
    Notification.create({
      action: 'volunteer.destroy.decline',
      // Sails returns an array of deleted models,
      // but we're only deleting them one at a time
      model: model[0]
    }, done);
  }
};

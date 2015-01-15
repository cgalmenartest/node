/**
 * User
 *
 * @module      :: Model
 * @description :: User representation
 *
 */

module.exports = {
  tableName: 'midas_user',
  attributes: {
    // Login information
    username: 'STRING',

    // Core attributes about a user
    name: 'STRING',

    // Professional Title
    title: 'STRING',

    // Biography
    bio: 'STRING',

    // User's profile photo
    // If photoId is not null, the URL to the file is /file/get/:id
    photoId: 'INTEGER',
    // If photoUrl is not null, then an external provider gave us the photo
    // Use the URL directly as the resource identifier for the photo.
    photoUrl: 'STRING',

    // User metadata for service delivery
    isAdmin: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // is the user's login disabled
    disabled: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    // Store the number of invalid password attempts
    passwordAttempts: {
      type: 'INTEGER',
      defaultsTo: 0
    }
  }

  // Blocked by 18f/midas#498
  // afterUpdate: function(model, done) {
  //   Notification.create({
  //     callerType: 'User',
  //     callerId: model.id,
  //     triggerGuid: require('node-uuid').v4(),
  //     action: 'userUpdated',
  //     createdDate: model.createdAt
  //   }).exec(function (err, newNotification){
  //     if (err) {
  //       sails.log.debug(err);
  //       done(null);
  //       return false;
  //     }
  //     done(null);
  //   });
  // }

};

/**
 * Notification
 *
 * @module      :: Model
 * @description :: A representation of a user-directed message
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    // ID of caller entity
    callerId: 'INTEGER',
    // type of caller entity
    callerType: 'STRING',
    // GUID of action trigger
    triggerGuid: 'STRING',
    // trigger action type
    action: 'STRING',
    // name of intended audience
    audience: 'STRING',
    // ID of user to whom the notification is directed
    recipientId: 'INTEGER',
    // Timestamp of creation
    createdDate: 'DATETIME',
    // JSON object representing local data needed to process the notification into a delivery
    localParams: 'STRING',
    // JSON object representing global data needed to process the notification into a delivery
    globalParams: 'STRING',
    // Future soft-delete functionality
    isActive: {
      'type': 'BOOLEAN',
      'defaultsTo': true,
    }
  }

};

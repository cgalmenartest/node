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
    // ID of user to whom the notification is directed
    recipientId: 'INTEGER',
    // Timestamp of creation
    createdDate: 'DATETIME',
    // JSON object representing implementation-specific data being contained inside of the triggering action
    data: 'STRING',
    // JSON object representing implementation-specific option for the processing of the action
    options: 'STRING',
    // Future soft-delete functionality
    isActive: {
      'type': 'BOOLEAN',
      'defaultsTo': true,
    }
  }

};

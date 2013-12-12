/**
 * Notification
 *
 * @module      :: Model
 * @description :: A representation of a user-directed message
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    // GUID of action trigger
    triggerGuid: 'STRING',
    // READ-ONLY trigger object for reference. Might later be persisted in own audit table
    trigger: 'STRING',
    // ID of user to whom the notification is directed
    recipientId: 'INTEGER',
    // Timestamp of creation
    createdDate: 'DATETIME',
    // JSON object representing implementation-specific data being contained inside of the triggering action
    data: 'STRING',
    // JSON object representing implementation-specific option for the processing of the action
    options: 'STRING',

    // Flag that denotes the notification as having been linked to all associated action triggers
    // isLinkedToTrigger: {
    //   'type': 'BOOLEAN',
    //   'defaultsTo': false,
    // },
    // Flag that denotes the notification as having been received and fully processed into deliveries
    isProcessed: {
      'type': 'BOOLEAN',
      'defaultsTo': false,
    },
    // Future soft-delete functionalirt
    isActive: {
      'type': 'BOOLEAN',
      'defaultsTo': true,
    }



  	// The type of notification; this is how consumers decide
  	// if they want to process this notification
  	// type: 'STRING'
  	// The Id of the entity that the notification originated from
  	// callerId: 'INTEGER',
  	// The caller’s application entity type (practically-speaking a databound model type)
  	// callerType: 'STRING',
  	// The content of the notification.  This is generator (type)
  	// dependent.  Can either be a string, or can be a JSON
  	// encoded object as a string (JSON text)
  	// content: 'STRING',
  	// state variable to indicate whether the notification
  	// was delivered (useful for UI indicators).  Default = false.
  	// isDelivered: {
   //    'type': 'BOOLEAN',
   //    'defaultsTo': false,
   //  }


  }

};

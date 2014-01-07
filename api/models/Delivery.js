/**
 * Delivery
 *
 * @module      :: Model
 * @description :: A representation of a concrete deliverable associated with a user notification
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    // ID of corresponding Notification
    notificationId: 'INTEGER',
    // DateTime that the delivery is issued
    deliveryDate: 'DATETIME',
    // Identifies the delivery mechanism to the delivery manager
    deliveryType: 'STRING',
    // eventual deliverable content
    content: 'STRING',
    // Flag that denotes the delivery as having been received by the recipient user
    isDelivered: {
      'type': 'BOOLEAN',
      'defaultsTo': false,
    },
    // Future soft-delete functionalirt
    isActive: {
      'type': 'BOOLEAN',
      'defaultsTo': true,
    }
  }
};

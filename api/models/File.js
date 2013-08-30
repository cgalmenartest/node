/**
 * File
 *
 * @module      :: Model
 * @description :: Store files and their metadata
 *
 */

module.exports = {

  attributes: {
    // ID of the user that created the file
    userId: 'INTEGER',
    // File name
    name: 'STRING',
    // Private file only accessible by the user
    isPrivate: {
      'type': 'BOOLEAN',
      'defaultsTo': false,
    },
    // Type of the file
    mimeType: 'STRING',
    // Size in bytes
    size: 'INTEGER',
    // Raw binary file data
    data: 'BINARY'
  }

};

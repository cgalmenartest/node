/**
 * Project
 *
 * @module      :: Model
 * @description :: Represents a Project that contains many tasks
 *
 */

module.exports = {

  attributes: {
    // Current state of the project
    // Valid vales are: open,assigned,completed,archived

    state: {
      type: 'STRING',
      defaultsTo: 'open'
    },
    // Project title
    title           : 'STRING',
    // Project description
    description     : 'STRING',
    // Cover image, refers to a file identifier
    coverId         : 'INTEGER'
  }

};

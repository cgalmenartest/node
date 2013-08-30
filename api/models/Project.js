/**
 * Project
 *
 * @module      :: Model
 * @description :: Represents a Project that contains many tasks
 *
 */

module.exports = {

  attributes: {
    // Current state of the project (active, closed, etc)
    state: {
      type: 'STRING',
      defaultsTo: 'draft'
    },
    // Project title
    title           : 'STRING',
    // Project description
    description     : 'STRING',
    // Cover image, refers to a file identifier
    coverId         : 'INTEGER'
  }

};

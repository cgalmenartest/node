/**
 * Comment
 *
 * @module      :: Model
 * @description :: Comment data model for nested comments on projects and tasks.
 *
 */

module.exports = {

  attributes: {

    // project id for this comment (null if it is a task comment)
    projectId: 'INTEGER',
    // task id for this comment (null if it is a project comment)
    taskId: 'INTEGER',
    // parent comment id for nested comments
    parentId: 'INTEGER',
    // user id of the person contributing the comment
    userId: 'INTEGER',
    // content of the comment
    value: 'STRING'
  }

};

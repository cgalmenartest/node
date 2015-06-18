/**
 * Comment
 *
 * @module      :: Model
 * @description :: Comment data model for nested comments on projects and tasks.
 *
 * Comments are organized hierarchically as follows:
 * Topic
 *  |-- Comment
 *     |-- Reply
 *
 * All comments MUST have a projectId or taskId.
 *
 * Topics are the first level, and have no parent (parentId = null).
 * When created, the topicId should be true.
 *
 * Comments are children of topics.  Comments should always have a
 * parentId that is equal to the topicId.  topic should be false (or unset).
 *
 * Replies are children of comments.  Replies should have the topicId
 * set to the main topic.  The parentId should be the id of the parent comment.
 */
module.exports = {

  attributes: {
    // topic id for the discussion (leave null on create to generate a topicId)
    // All comments MUST include a topic id (and optionally parentId) to prevent
    // a new topic from being generated.
    topic: {
        type: 'BOOLEAN',
        defaultsTo: false
    },
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
  },

  // Notify owners
  afterCreate: function(model, done) {
    Notification.create({
      action: 'comment.create.owner',
      model: model
    }, done);
  }

};

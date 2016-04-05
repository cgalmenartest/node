/**
 * Attachment
 *
 * @module      :: Model
 * @description :: A mapping between files and projects/tasks to
 *                 form a list of attachments.
 *
 */

module.exports = {

  attributes: {
    // reference to the file that has been attached
    fileId: 'INTEGER',
    // Select ONE of project or task, to associate this attachment
    // with that project or task
    taskId: 'INTEGER',
    // The userId of the person that created the attachment
    userId: 'INTEGER',
  }

};

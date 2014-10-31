/*---------------------
    :: Task
    -> model
---------------------*/
module.exports = {

  attributes: {
    // Current state of the task
    state: {
        type: 'STRING',
        defaultsTo: 'open'
    },
    // user id of the task owner
    userId: 'INTEGER',
    // project id of the parent project
    projectId: 'INTEGER',
    // title of the task
    title: 'STRING',
    // description of the task
    description: 'STRING',

  }

};

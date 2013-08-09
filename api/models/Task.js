/*---------------------
    :: Task
    -> model
---------------------*/
module.exports = {

  attributes: {
    // Current state of the task (active, closed, etc)
    state: {
        type: 'STRING',
        defaultsTo: 'draft'
    },
    // user id of the task owner
    userId: 'INTEGER',
    // project id of the parent project
    projectId: 'INTEGER',
    // title of the task
    title: 'STRING',
    // description of the task
    description: 'STRING',
    // estimated time to complete the task
    estimatedTime: 'STRING',
    // deadline by which the task must be completed
    deadline: 'DATETIME'

    /* Volunteer type is not yet added and needs to be spec'd.
       Volunteer type includes:
       - Is the first person accepted, or is a group allowed to apply?
       - Will the task be assigned to one person or multiple people?
    */
    /* Location is not yet added because Sails doesn't
       yet have support for GIS extensions to postgresql.
       Location will also need a modifier, such as how far
       away from the location is acceptable, and whether
       location is a required qualification.
       */
    // location: 'UNKNOWN'
  }

};

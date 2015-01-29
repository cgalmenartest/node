/*---------------------
    :: Task
    -> model
---------------------*/
module.exports = {

  attributes: {
    // Current state of the task
    state: {
        type: 'STRING',
        defaultsTo: sails.config.taskState || 'open'
    },
    // user id of the task owner
    userId: 'INTEGER',
    // project id of the parent project
    projectId: 'INTEGER',
    // title of the task
    title: 'STRING',
    // description of the task
    description: 'STRING',

    isOpen: function(){
        if ( _.indexOf(['open','public','assigned'],this.state) != -1 ){
            return true;
        }
        return false;
    },

    isClosed: function(){
        if ( _.indexOf(['closed','archived','completed'],this.state) != -1 ){
            return true;
        }
        return false;
    }
  },

  afterCreate: function(model, done) {
    Notification.create({
      callerType: 'Task',
      callerId: model.id,
      triggerGuid: require('node-uuid').v4(),
      action: 'taskCreated',
      createdDate: model.createdAt
    }).exec(function (err, newNotification){
      if (err) {
        sails.log.debug(err);
        done(null);
        return false;
      }
      done(null);
    });
  }

};

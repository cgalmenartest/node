module.exports = {

  subject: '"<%- model.title %>" has a new comment on <%= globals.systemName %>',

  to: '<%- owner.username %>',

  /*
  * Prepares the data object to render templates
  * @param {Notification} notification model
  * @param {function} callback called with err, data
  * data.globals defaults to sails.config
  */
  data: function(model, done) {
    var data = {
          comment: model,
          commenter: {},
          model: {},
          owner: {}
        };
    User.findOne({ id: model.userId }).exec(function(err, commenter) {
      if (err) return done(err);

      var Model = (model.projectId) ? Project : Task,
          modelID = model.projectId || model.taskId;

      data.commenter = commenter;

      Model.findOne({ id: modelID }).exec(function(err, model) {
        if (err) return done(err);
        data.model = model;

        User.findOne({ id: model.userId }).exec(function(err, owner) {
          if (err) return done(err);
          data.owner = owner;

          done(null, data);
        });

      });

    });
  }
};

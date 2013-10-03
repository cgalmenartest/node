define([
  'bootstrap',
  'popover',
  'underscore',
  'backbone',
  'text!task_show_template'
], function (Bootstrap, Popover, _, Backbone, TaskShowTemplate) {

  var TaskItemView = Backbone.View.extend({

    // Empty container for task show page
    // Aka item view.

    render: function () {
      var compiledTemplate = _.extend(TaskShowTemplate, this.model.toJSON())
      $(this.el).html(compiledTemplate)

      return this;
    }

  });

  return TaskItemView;
})
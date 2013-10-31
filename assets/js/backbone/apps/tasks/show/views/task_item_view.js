define([
  'bootstrap',
  'popovers',
  'underscore',
  'backbone',
  'text!task_show_template'
], function (Bootstrap, Popovers, _, Backbone, TaskShowTemplate) {

  var TaskItemView = Backbone.View.extend({

    // Empty container for task show page
    // Aka item view.
    el: "#container",

    render: function () {
      var compiledTemplate = _.extend(TaskShowTemplate)
      $(this.el).html(compiledTemplate)

      return this;
    },

    cleanup: function () {
      $(this.el).children().remove();
    }

  });

  return TaskItemView;
})
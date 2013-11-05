define([
  'bootstrap',
  'popovers',
  'underscore',
  'backbone',
  'base_view',
  'text!task_show_template'
], function (Bootstrap, Popovers, _, Backbone, BaseView, TaskShowTemplate) {

  var TaskItemView = BaseView.extend({

    // Empty container for task show page
    // Aka item view.
    el: "#container",

    render: function () {
      var compiledTemplate = _.template(TaskShowTemplate, this.model.toJSON());
      $(this.el).html(compiledTemplate)
    },

    cleanup: function () {
      $(this.el).children().remove();
    }

  });

  return TaskItemView;
})
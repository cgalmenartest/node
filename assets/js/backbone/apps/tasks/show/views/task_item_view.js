define([
  'bootstrap',
  'popover',
  'underscore',
  'backbone'
], function (Bootstrap, Popover, _, Backbone) {

  var TaskItemView = Backbone.View.extend({

    // Empty container for task show page
    // Aka item view.

    render: function () {
      return this;
    }

  });

  return TaskItemView;
})
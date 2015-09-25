
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var AdminTaskTemplate = require('../templates/admin_task_template.html');


var AdminTaskView = Backbone.View.extend({

  events: {
    'click .delete-task': 'deleteTask'
  },

  initialize: function (options) {
    this.options = options;
    this.data = {
      page: 1
    };
  },

  render: function () {
    var self = this;
    $.ajax({
      url: '/api/admin/tasks',
      data: this.data,
      dataType: 'json',
      success: function (data) {
        var template = _.template(AdminTaskTemplate)(data);
        self.$el.html(template);
        self.$el.show();
        $('.tip').tooltip();
      }
    });

    Backbone.history.navigate('/admin/tasks');
    return this;
  },

  deleteTask: function(e) {
    var view = this,
        id = $(e.currentTarget).data('task-id'),
        title = $(e.currentTarget).data('task-title');
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete "' + title + '"?')) {
      $.ajax({
        url: '/api/task/' + id,
        type: 'DELETE'
      }).done(function() {
        view.render();
      });
    }
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = AdminTaskView;

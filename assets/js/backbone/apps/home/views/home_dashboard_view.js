var _ = require('underscore');
var Backbone = require('backbone');
var async = require('async');
var UIConfig = require('../../../config/ui.json');

var ActivityCollection = require('../../../entities/activities/activities_collection');
var TaskCollection = require('../../../entities/tasks/tasks_collection');

var DashboardTemplate = require('../templates/home_dashboard_template.html');

var DashboardView = Backbone.View.extend({

  el: "#container",
  template: _.template(DashboardTemplate),
  initialize: function (options) {
    this.options = options;

    return this;
  },

  render: function () {
    var self       = this,
        activities = new ActivityCollection(),
        tasks      = new TaskCollection();

    this.$el.addClass('home');
    this.listenTo(activities, 'activity:collection:fetch:success', function (e) {
      var html = self.template({ data: activities.toJSON() });
      self.$el.html(html);
      self.$el.i18n();
    });

    tasks.fetch({
      success: function (collection) {
        var open = collection.filter(function(t) {
          return t.attributes.state !== 'completed';
        });
        $('#opportunity-count span').text(open.length);
      },
      error: function () {
        $('#opportunity-count span').text('many');
      }
    });

    return this;
  },

  cleanup: function () {
    this.$el.removeClass('home');
    removeView(this);
  },
});

module.exports = DashboardView;

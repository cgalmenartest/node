var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var ModalComponent = require('../../../components/modal');
var AdminDashboardTemplate = require('../templates/admin_dashboard_template.html');
var AdminDashboardTable = require('../templates/admin_dashboard_table.html');
var AdminDashboardActivities = require('../templates/admin_dashboard_activities.html');
var LoginConfig = require('../../../config/login.json');


var AdminDashboardView = Backbone.View.extend({

  events: {
  },

  initialize: function (options) {
    this.options = options;
    this.data = {
      page: 1
    };
  },

  render: function () {
    var self = this;
    Backbone.history.navigate('/admin/dashboard');
    this.$el.show();
    if (this.rendered === true) {
      return this;
    }
    var data = {
      user: window.cache.currentUser,
      login: LoginConfig
    };
    var template = _.template(AdminDashboardTemplate)(data);
    this.$el.html(template);
    this.rendered = true;
    // fetch data
    this.fetchData(self, this.data);
    return this;
  },

  renderMetrics: function (self, data) {
    var template = _.template(AdminDashboardTable)(data);
    self.$(".metric-block").html(template);
    this.$el.i18n();
    // hide spinner and show results
    self.$(".spinner").hide();
    self.$(".metric-block").show();
  },

  renderActivities: function (self, data) {
    var template = _.template(AdminDashboardActivities);
    self.$(".activity-block").html(template);
    _(data).forEach(function(activity) {

      if (!activity || ( activity.comment && typeof activity.comment.value == "undefined") ) return;
      // Strip HTML from comments
      if (activity.comment) {
        var value = activity.comment.value.replace(/<(?:.|\n)*?>/gm, '');
        activity.comment.value = value;
      }
      // Format timestamp
      activity.createdAtFormatted = $.timeago(activity.createdAt);
      var template = self.$('#' + activity.type).text(),
          content = _.template(template, { escape: /\{\{(.+?)\}\}/g })(activity);
      self.$('.activity-block .activity-feed').append(content);
    });

    this.$el.i18n();
    // hide spinner and show results
    self.$(".spinner").hide();
    self.$(".activity-block").show();
  },

  fetchData: function (self, data) {
    $.ajax({
      url: '/api/admin/metrics',
      dataType: 'json',
      data: data,
      success: function (data) {
        self.data = data;
        $.ajax({
          url: '/api/admin/interactions',
          dataType: 'json',
          data: data,
          success: function(interactions) {
            data.interactions = interactions;
            interactions.count = _(interactions).reduce(function(sum, value, key) {
              return sum + value;
            }, 0);
            self.renderMetrics(self, data);
          }
        });
      }
    });
    $.ajax({
      url: '/api/admin/activities',
      dataType: 'json',
      data: data,
      success: function (data) {
        self.data = data;
        self.renderActivities(self, data);
      }
    });
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = AdminDashboardView;

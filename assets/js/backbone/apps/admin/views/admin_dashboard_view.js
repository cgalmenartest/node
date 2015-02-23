define([
  'jquery',
  'underscore',
  'backbone',
  'i18n',
  'utilities',
  'modal_component',
  'text!admin_dashboard_template',
  'text!admin_dashboard_table',
  'text!admin_dashboard_activities',
  'json!login_config'
], function ($, _, Backbone, i18n, utils, ModalComponent, AdminDashboardTemplate, AdminDashboardTable, AdminDashboardActivities, LoginConfig) {

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
      var template = _.template(AdminDashboardTemplate, data);
      this.$el.html(template);
      this.rendered = true;
      // fetch data
      this.fetchData(self, this.data);
      return this;
    },

    renderMetrics: function (self, data) {
      var template = _.template(AdminDashboardTable, data);
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
        if (!activity) return;
        // Strip HTML from comments
        if (activity.comment) {
          var value = activity.comment.value.replace(/<(?:.|\n)*?>/gm, '');
          activity.comment.value = value;
        }
        // Format timestamp
        activity.createdAtFormatted = $.timeago(activity.createdAt);
        var template = self.$('#' + activity.type).text(),
            content = _.template(template, activity, { escape: /\{\{(.+?)\}\}/g });
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
            },
            error: function (xhr, status, error) {
              self.handleError(self, xhr, status, error);
            }
          });
        },
        error: function (xhr, status, error) {
          self.handleError(self, xhr, status, error);
        }
      });
      $.ajax({
        url: '/api/admin/activities',
        dataType: 'json',
        data: data,
        success: function (data) {
          self.data = data;
          self.renderActivities(self, data);
        },
        error: function (xhr, status, error) {
          self.handleError(self, xhr, status, error);
        }
      });
    },

    handleError: function (self, xhr, status, error) {
      // show the alert message and hide the spinner
      self.$('.alert').html(error.message || error);
      self.$('.alert').show();
      self.$('.spinner').hide();
    }
  });

  return AdminDashboardView;
});

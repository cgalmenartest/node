define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'modal_component',
  'text!admin_dashboard_template',
  'text!admin_dashboard_table',
  'json!login_config'
], function ($, _, Backbone, utils, ModalComponent, AdminDashboardTemplate, AdminDashboardTable, LoginConfig) {

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
      // fetch metric data
      this.fetchData(self, this.data);
      return this;
    },

    renderMetrics: function (self, data) {
      var template = _.template(AdminDashboardTable, data);
      self.$(".metric-block").html(template);
      // hide spinner and show results
      self.$(".spinner").hide();
      self.$(".metric-block").show();
    },

    fetchData: function (self, data) {
      $.ajax({
        url: '/api/admin/metrics',
        dataType: 'json',
        data: data,
        success: function (data) {
          self.data = data;
          self.renderMetrics(self, data);
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

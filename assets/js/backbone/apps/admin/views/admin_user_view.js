define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!admin_user_template',
  'text!admin_user_table',
  'text!admin_paginate'
], function ($, _, Backbone, utils, AdminUserTemplate, AdminUserTable, Paginate) {

  var AdminUserView = Backbone.View.extend({

    events: {
      "click a.page"              : "clickPage",
      "click .admin-user-mkadmin" : "adminCreate",
      "click .admin-user-rmadmin" : "adminRemove",
      "click .admin-user-enable"  : "adminEnable",
      "click .admin-user-disable" : "adminDisable",
      "keyup #user-filter"        : "filter"
    },

    initialize: function (options) {
      this.options = options;
      this.data = {
        page: 1
      };
    },

    render: function () {
      var self = this;
      Backbone.history.navigate('/admin/user');
      this.$el.show();
      if (this.rendered === true) {
        return this;
      }
      var data = {

      };
      var template = _.template(AdminUserTemplate, data);
      this.$el.html(template);
      this.rendered = true;
      // fetch user data
      this.fetchData(self, this.data);
      return this;
    },

    renderUsers: function (self, data) {
      data.urlbase = '/admin/users';
      data.q = data.q || '';
      // if the limit of results coming back hasn't been set yet
      // use the server's default
      if (!self.limit) {
        self.limit = data.limit;
      }
      data.trueLimit = self.limit;
      // render the table
      var template = _.template(AdminUserTable, data);
      // render the pagination
      var paginate = _.template(Paginate, data);
      self.$("#user-page").html(paginate);
      self.$(".table-responsive").html(template);
      self.$(".btn").tooltip();
      // hide spinner and show results
      self.$(".spinner").hide();
      self.$(".table-responsive").show();
    },

    clickPage: function (e) {
      var self = this;
      // if meta or control is held, or if the middle mouse button is pressed,
      // let the link process normally.
      // eg: open a new tab or window based on the browser prefs
      if ((e.metaKey === true) || (e.ctrlKey === true) || (e.which == 2)) {
        return;
      }
      if (e.preventDefault) e.preventDefault();
      // load this page of data
      this.fetchData(self, {
        page: $(e.currentTarget).data('page'),
        q: $($(e.currentTarget).parent('ul')[0]).data('filter'),
        limit: this.limit
      });
    },

    filter: function (e) {
      // get the input box value
      var val = $(e.currentTarget).val().trim();
      // if the filter is the same, don't do anything
      if (val == this.q) {
        return;
      }
      this.q = val;
      // hide the table and show the spinner
      this.$(".table-responsive").hide();
      this.$(".spinner").show();
      // fetch this query, starting from the beginning page
      this.fetchData(this, {
        q: val
      });
    },

    fetchData: function (self, data) {
      // perform the ajax request to fetch the user list
      $.ajax({
        url: '/api/admin/users',
        dataType: 'json',
        data: data,
        success: function (data) {
          self.data = data;
          self.renderUsers(self, data);
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
    },

    adminCreate: function (e) {
      if (e.preventDefault) e.preventDefault();
      var t = $(e.currentTarget);
      var id = $(t.parents('tr')[0]).data('id');
      this.updateUser(t, {
        id: id,
        isAdmin: true,
        url: '/api/admin/admin/' + id + '?action=true'
      });
    },

    adminRemove: function (e) {
      if (e.preventDefault) e.preventDefault();
      var t = $(e.currentTarget);
      var id = $(t.parents('tr')[0]).data('id');
      this.updateUser(t, {
        id: id,
        isAdmin: false,
        url: '/api/admin/admin/' + id + '?action=false'
      });
    },

    adminEnable: function (e) {
      if (e.preventDefault) e.preventDefault();
      var t = $(e.currentTarget);
      var id = $(t.parents('tr')[0]).data('id');
      this.updateUser(t, {
        id: id,
        disabled: false,
        url: '/api/user/enable/' + id
      });
    },

    adminDisable: function (e) {
      if (e.preventDefault) e.preventDefault();
      var t = $(e.currentTarget);
      var id = $(t.parents('tr')[0]).data('id');
      this.updateUser(t, {
        id: id,
        disabled: true,
        url: '/api/user/disable/' + id
      });
    },

    updateUser: function (t, data) {
      var self = this;
      var spinner = $($(t.parent()[0]).children('.btn-spin')[0])
      spinner.show();
      t.hide();
      if (data.url) {
        $.ajax({
          url: data.url,
          dataType: 'json',
          success: function (d) {
            // hide the spinner
            spinner.hide();
            // show the opposite button
            if (data.disabled === true) {
              $(t.siblings(".admin-user-enable")[0]).show();
            }
            if (data.disabled === false) {
              $(t.siblings(".admin-user-disable")[0]).show();
            }
            if (data.isAdmin === true) {
              $(t.siblings(".admin-user-rmadmin")[0]).show();
            }
            if (data.isAdmin === false) {
              $(t.siblings(".admin-user-mkadmin")[0]).show();
            }
          },
          error: function (xhr, status, error) {
            self.handleError(self, xhr, status, error);
          }
        });
      }
    },

    cleanup: function () {
      removeView(this);
    },
  });

  return AdminUserView;
});

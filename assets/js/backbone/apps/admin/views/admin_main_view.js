define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'admin_user_view',
  'admin_tag_view',
  'text!admin_main_template',
], function ($, _, Backbone, utils, AdminUserView, AdminTagView, AdminMainTemplate) {

  var AdminMainView = Backbone.View.extend({

    events: {
      'click .link-admin'             : 'link'
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var data = {

      };
      var template = _.template(AdminMainTemplate, data);
      this.$el.html(template);
      this.routeTarget(this.options.action || '');
      return this;
    },

    routeTarget: function (target) {
      if (!target) {
        target = 'user';
      }
      var t = $((this.$("[data-target=" + target + "]"))[0]);
      // remove active classes
      $($(t.parents('ul')[0]).find('li')).removeClass('active');
      // make the current link active
      $(t.parent('li')[0]).addClass('active');
      if (target == 'user') {
        if (!this.adminUserView) {
          this.initializeAdminUserView();
        }
        this.hideOthers();
        this.adminUserView.render();
      } else if (target == 'tag') {
        if (!this.adminTagView) {
          this.initializeAdminTagView();
        }
        this.hideOthers();
        this.adminTagView.render();
      }
    },

    link: function (e) {
      if (e.preventDefault) e.preventDefault();
      var t = $(e.currentTarget);
      this.routeTarget(t.data('target'));
    },

    hideOthers: function () {
      this.$(".admin-container").hide();
    },

    initializeAdminUserView: function () {
      if (this.adminUserView) {
        this.adminUserView.cleanup();
      }
      this.adminUserView = new AdminUserView({
        el: "#admin-user"
      });
    },

    initializeAdminTagView: function () {
      if (this.adminTagView) {
        this.adminTagView.cleanup();
      }
      this.adminTagView = new AdminTagView({
        el: "#admin-tag"
      });
    },

    cleanup: function () {
      if (this.adminUserView) this.adminUserView.cleanup();
      if (this.adminTagView) this.adminTagView.cleanup();
      removeView(this);
    },
  });

  return AdminMainView;
});

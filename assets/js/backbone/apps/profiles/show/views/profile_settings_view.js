define([
  'jquery',
  'async',
  'underscore',
  'backbone',
  'utilities',
  'text!profile_settings_template'
], function ($, async, _, Backbone, utils, ProfileSettingsTemplate) {

  var ProfileSettingsView = Backbone.View.extend({

    events: {
    },

    initialize: function (options) {
      this.options = options;
      this.data = options.data;
    },

    render: function () {
      var data = {
        user: window.cache.currentUser || {}
      }
      var template = _.template(ProfileSettingsTemplate, data);
      this.$el.html(template);
      return this;
    },

    cleanup: function () {
      removeView(this);
    },

  });

  return ProfileSettingsView;
});

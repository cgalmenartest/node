define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'json!ui_config',
  'async',
  'text!profile_activity_template'
], function ($,  _, Backbone, utils, UIConfig,
             async, ActTemplate) {

  var ProfileActivityView = Backbone.View.extend({

    events: {
      'click .activity-link'    : 'link'
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      // sort initially by date, descending.
      var results = this.options.data.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      var data = {
        ui: UIConfig,
        target: this.options.target,
        data: results,
        count: {}
      };
      for (var i in this.options.data) {
        if (_.isUndefined(data.count[this.options.data[i].state])) {
          data.count[this.options.data[i].state] = 1;
        } else {
          data.count[this.options.data[i].state]++
        }
      }
      var template = _.template(ActTemplate, data);
      this.$el.html(template);

      return this;
    },

    link: function (e) {
      if (e.preventDefault) e.preventDefault();
      Backbone.history.navigate(this.options.target + 's/' + $(e.currentTarget).data('id'), { trigger: true });
    },

    cleanup: function () {
      removeView(this);
    },

  });

  return ProfileActivityView;
});

define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!admin_tag_template'
], function ($, _, Backbone, utils, AdminTagTemplate) {

  var AdminTagView = Backbone.View.extend({

    events: {
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var data = {

      };
      var template = _.template(AdminTagTemplate, data);
      this.$el.html(template);
      this.$el.show();
      Backbone.history.navigate('/admin/tag');
      return this;
    },

    cleanup: function () {
      removeView(this);
    },
  });

  return AdminTagView;
});


var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var AdminParticipantsTemplate = require('../templates/admin_participants_template.html');


var AdminParticipantsView = Backbone.View.extend({

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

    this.$el.show();

    $.ajax({
      url: '/api/admin/participants',
      data: this.data,
      dataType: 'json',
      success: function (data) {
        var template = _.template(AdminParticipantsTemplate, {
              variable: 'data'
            })(data);
        self.$el.html(template);
        $('.tip').tooltip();
      }
    });

    Backbone.history.navigate('/admin/participants');
    return this;
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = AdminParticipantsView;

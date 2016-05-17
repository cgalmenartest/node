var _ = require('underscore');
var Backbone = require('backbone');

// templates
var fs = require('fs');
var AdminAgenciesTemplate = fs.readFileSync(`${__dirname}/../templates/admin_agencies_template.html`).toString();

var AdminAgenciesView = Backbone.View.extend({

  events: {
    'click .link'             : 'link'
  },

  initialize: function (options) {
    this.options = options;
    this.adminMainView = options.adminMainView;
    this.data = {
      agency: window.cache.currentUser.agency
    };
    console.log('AdminAgenciesView data', this.data.agency);
  },

  render: function () {
    var self = this;

    this.$el.show();

    // get meta data for agency
    $.ajax({
      url: '/api/admin/agency/' + this.data.agency.id,
      dataType: 'json',
      success: function (data) {
        var template = _.template(AdminAgenciesTemplate, {
          variable: 'agency'
        })(data);
        self.$el.html(template);
      }
    });

    Backbone.history.navigate('/admin/agencies/' + this.data.agency.slug);
    return this;
  },

  link: function (e) {
    console.log('link this.data.agency.slug', this.data.agency.slug)
    if (e.preventDefault) e.preventDefault();
    var t = $(e.currentTarget);
    this.adminMainView.routeTarget(t.data('target'), this.data.agency.slug);
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = AdminAgenciesView;

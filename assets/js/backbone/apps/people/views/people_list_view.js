var _ = require('underscore');
var Backbone = require('backbone');
var listTemplate = require('../templates/people_list_template.html');

var PeopleListView = Backbone.View.extend({

  template: _.template(listTemplate),

  initialize: function (options) {
    this.el = options.el;
    this.listenTo(window.cache.userEvents, "people:list", this.render);
  },

  render: function (peopleCollection) {
    if (!peopleCollection) return;
    this.$el.html(this.template({people: peopleCollection}));
  },

  close: function () {
    this.remove();
  }

});

module.exports = PeopleListView;

var _ = require('underscore');
var Backbone = require('backbone');
var listTemplate = require('../templates/people_list_template.html');

var PeopleListView = Backbone.View.extend({

  template: _.template(listTemplate),

  initialize: function (options) {
    this.el = options.el;
    this.listenTo(window.cache.userEvents, "people:list", this.render);
    this.listenTo(window.cache.userEvents, "people:list:remove", this.empty);
  },

  render: function (peopleCollection) {
    if (!peopleCollection) return;
    this.$el.html(this.template({people: peopleCollection}));
  },

  empty: function () {
    this.$el.html("");
  },

  close: function () {
    this.remove();
  }

});

module.exports = PeopleListView;

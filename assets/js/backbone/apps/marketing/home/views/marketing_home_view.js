define([
  'underscore',
  'backbone',
  'text!marketing_home_template'
], function (_, Backbone, MarketingHomeTemplate) {
    
  Application.Views = {};

  Application.Views.HomeView = Backbone.View.extend({

    render: function () { 
      var template = _.template(MarketingHomeTemplate);
      this.$el.html(template);
      return this;
    }

  });    
  
  return Application.Views.HomeView;

});
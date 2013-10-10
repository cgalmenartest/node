define([
  'jquery',
  'underscore',
  'backbone',
  'base_component',
  'bootstrap'
], function ($, _, Backbone, BaseComponent, Bootstrap) {

  Application.Component.Popovers = BaseComponent.extend({

    popoverPeopleInit: function (target) {
      $(target).popover(
        {
          placement: 'auto top',
          trigger: 'manual',
          html: 'true',
          title: 'load',
          container: 'body',
          content: '<div class="popover-spinner"><div class="loading">Fetching Information</div><i class="icon-spinner icon-spin"></i></div>',
          template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title" style="display:none; visibility:hidden"></h3><div class="popover-content"></div></div>'
        });
    },

    popoverPeopleOn: function (e) {
      if (e.preventDefault()) e.preventDefault();
      var target = $(e.currentTarget);
      var popover = target.data('bs.popover');
      target.popover('show');
      // Only load data if the popover hasn't previously been loaded
      if (popover.options.title == 'load') {
        $.ajax({ url: '/api/user/info/' + target.data('userid') }).done(function(data) {
          data.company = 'General Services Administration';
          data.title = 'Presidential Innovation Fellow';
          popover.options.title = 'done';
          popover.options.content = '<img align="left" src="/user/photo/' + data.id + '" class="project-people-popover"/><div class="popover-person"><div class="title">' + data.name + '</div>' + data.title + '<br/>' + data.company + '</div>';
          popover.setContent();
          popover.$tip.addClass(popover.options.placement);
        });
      }
    },

    popoverPeopleOff: function (e) {
      if (e.preventDefault()) e.preventDefault();
      var target = $(e.currentTarget);
      target.popover('hide');
    }
  });

  return Application.Component.Popovers;
});

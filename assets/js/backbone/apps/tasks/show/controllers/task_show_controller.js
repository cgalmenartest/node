// Here I  will attempt to keep all the logic for tags in the controller
// and not in the view layer.  If this works then we can move
// the project view tag methods out to the controller as it should be.

define([
  'bootstrap',
  'underscore',
  'backbone'
], function (Bootstrap, _, Backbone) {

  var Application.Controller.TaskShowController = Backbone.View.extend({

    initialize: function () {
      this.initializeTags();
    }


  });

  return Application.Controller.TaskShowController;
})
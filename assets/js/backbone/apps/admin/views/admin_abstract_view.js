var _ = require('underscore');
var Backbone = require('backbone');


var AdminAbstractView = Backbone.View.extend({

  initialize: function () {
    this.handlingAuthError = false;
  },

  handleError: function (self, xhr, status, error) {
    // special case auth errors, force login
    self.$('.spinner').hide();
    if (xhr.status === 401 || xhr.status === 403) {
      if (self.handlingAuthError) return;
      self.handlingAuthError = true;
      window.cache.userEvents.trigger("user:request:login", {
        message: "You must be logged in as an administrator.",
        disableClose: false
      });
    } else {
      self.$('.alert').html(error.message || error);
      self.$('.alert').show();
    }
  },

  cleanup: function () {
    this.handlingAuthError = false;
    removeView(this);
  }

});

module.exports = AdminAbstractView;

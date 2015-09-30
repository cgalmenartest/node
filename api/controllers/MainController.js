/**
 * MainController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  index: function(req, res) {
    // include data variables for the view passed by the policies
    var flash = req.flash('message');
    var data = {
      systemName: sails.config.systemName,
      draftAdminOnly: sails.config.draftAdminOnly || false,
      alert: req.alert || (flash.length) ? { message: flash[0] } : null || null,
      user: (req.user) ? _(req.user).mapValues(function(value) {
        return (typeof value === 'string') ? _.escape(value) : value;
      }).omit('inspect').value() : null
    };
    // get version information
    sails.config.version(function (v) {
      data.version = v;
      data.version.cache = v.gitLong || Date.now();
      // set cache headers to refresh every hour
      res.set('Cache-Control', 'no-transform,public,max-age=3600,s-maxage=3600'); // HTTP 1.1.
      res.view(data);
    });
  },

  // Tasks the should run on a cron schedule
  cron: function(req, res) {
    if (req.param('token') !== sails.config.cron_token) return res.send(400, 'No token');
    res.send(200);

    // Check for near due tasks
    Task.sendNotifications(7);

    // Check for due tasks
    Task.sendNotifications();

  }
};

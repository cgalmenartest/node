/**
 * MainController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  index: function(req, res) {
    // include data variables for the view passed by the policies
    var data = {
      systemName: sails.config.systemName,
      alert: req.alert || null
    };
    // get version information
    sails.config.version(function (v) {
      data.version = v;
      // set cache headers to refresh every hour
      res.set('Cache-Control', 'no-transform,public,max-age=3600,s-maxage=3600'); // HTTP 1.1.
      res.view(data);
    });
  }
};

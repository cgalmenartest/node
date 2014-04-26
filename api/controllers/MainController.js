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
      res.view(data);
    });
  }
};

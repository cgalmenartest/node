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
    res.view(data);
  }
}

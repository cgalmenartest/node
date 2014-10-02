/**
 * UserSettingController
 *
 * @module    :: Controller
 * @description :: Interaction with user settings
 */
var userUtil = require('../services/utils/user');

module.exports = {

  find: function (req, res) {
    UserSetting.findByUserId(req.params.id)
    .done(function(err,settings){
      return res.send(settings);
    });
  }
};
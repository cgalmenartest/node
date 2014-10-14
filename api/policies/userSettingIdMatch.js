/**
* Check that the setting user id matches the logged in userId
*/

module.exports = function userSettingIdMatch (req, res, next) {
  UserSetting.findOneById(req.route.params.id, function (err, setting) {
    if (err) { return res.send(400, { 'message': 'Error occurred looking up setting' }); }
    if (!setting) { return res.send(404); }
    if (setting.userId != req.user[0].id) {
      return res.send(403, { 'message': 'Not Authorized' });
    }
    next();
  });
};

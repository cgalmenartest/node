/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Get and update information about currently logged in user.
 */

module.exports = {
  index: function(req, res) {
    // If the user is not logged in, return null object
    if (!req.user) {
      return res.send(403, null);
    }
    // Get information about the currently logged in user
    if (req.route.method === 'get') {
      sails.log.debug('User Get:', user);
      if (req.route.params.id) {
        User.findOneById(req.route.params.id, function (err, user) {
          if (err) { return res.send(400, {message:'Error looking up user'}); }
          return res.send(user);
        });
      }
      return res.send(req.user[0]);
    }
    // Update information about the currently logged in user
    else if (req.route.method === 'put') {
      var user = req.user[0];
      if (req.params.name) { user.name = req.params.name; }
      if (req.params.email) { user.email = req.params.email; }
      if (req.params.photoId) { user.photoUrl = req.params.photoId; }
      if (req.params.photoUrl) { user.photoUrl = req.params.photoUrl; }
      sails.log.debug('User Update:', user);
      user.save(function (err) {
        if (err) { return res.send(400, {message:'Error while saving user.'}) }
        return res.send(user);
      });
    }
    return res.send(400, {message:'Invalid Operation'});
  }
};

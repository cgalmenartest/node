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
      var user = {
        id: req.user[0].id,
        name: req.user[0].name,
        email: req.user[0].email,
        photoUrl: req.user[0].photoUrl,
        isAdmin: req.user[0].isAdmin
      }
      sails.log.debug('User Get:', user);
      return res.send(user);
    }
    // Update information about the currently logged in user
    else if (req.route.method === 'put') {
      var user = req.user[0];
      if (req.params.name) { user.name = req.params.name; }
      if (req.params.email) { user.email = req.params.email; }
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

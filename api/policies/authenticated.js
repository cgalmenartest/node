/**
* Allow any authenticated user.
*/
module.exports = function authenticated (req, res, next) {

  // If the request is a GET, allow anyone to access.
  if (req.route.method === 'get') {
    return next();
  }

  // User is allowed, proceed to controller for all other operations
  if (req.isAuthenticated()) {
    return next();
  }
  // Could redirect the user, although most routes are APIs
  // since backbone handles the user views
  // res.redirect('/auth')

  // User is not allowed, send 403 message
  else {
    return res.send(403, {message: "You are not permitted to perform this action."});
  }
};

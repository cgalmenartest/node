/**
* Require the user to be logged in.
*/

module.exports = function requireUserId (req, res, next) {
  if (!req.user) {
    return res.send(403, { message: 'Not authorized'});
  }
  next();
};

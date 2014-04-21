/**
* Only allow owners or admins to pass through
*/

module.exports = function addUserId (req, res, next) {
  if (req.isOwner || req.user[0].isAdmin) {
    return next();
  }
  return res.send(403, { message: "Not authorized." });
};
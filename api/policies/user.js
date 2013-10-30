/**
* Check that the :id parameter matches logged in user
*/

module.exports = function user (req, res, next) {
  if (req.route.params.id == req.user[0].id) {
    return next();
  }
  return res.send(403, { message: 'Not Authorized.' });
};

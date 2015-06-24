/**
* Determines whether the logged in user owns this volunteer
*/
module.exports = function volunteer (req, res, next) {

  Volunteer.findOneById(req.params.id, function (err, v) {
    if (err || !v) { return res.send(400, { message: 'Error finding volunteer status'}); }

    // Volunteer must be owned by the user (used by ownerOrAdmin() )
    req.isOwner = (v.userId == req.user[0].id);
    return next();
  });
};

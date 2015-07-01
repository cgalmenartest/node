/**
* Determines whether the logged in user has rights to this volunteer
*/
module.exports = function volunteer (req, res, next) {

  Volunteer.findOneById(req.params.id, function (err, v) {
    if (err || !v) { return res.send(400, { message: 'Error finding volunteer status'}); }

    Task.findOneById(v.taskId, function (err, t) {
        if (err || !t) { return res.send(400, { message: 'Error finding corresponding task for volunteer'}); }

        // Volunteer is owned by either the user that volunteered,
        // or the owner of the task. (used by ownerOrAdmin() )
        req.isOwner = (v.userId == req.user[0].id) ||
                      (t.userId == req.user[0].id);
        return next();
    });
  });
};

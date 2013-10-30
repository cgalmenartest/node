/**
 * UserEmailController
 *
 * @module		:: Controller
 * @description	:: Add/delete/find user emails
 */

module.exports = {

  findAllByUserId: function (req, res) {
    UserEmail.findByUserId(req.user[0].id, function (err, emails) {
      if (err) { return res.send(400, { message: 'Error looking up emails.' }); }
      return res.send(emails);
    });
  }

};

/**
 * UserEmailController
 *
 * @module		:: Controller
 * @description	:: Add/delete/find user emails
 */

module.exports = {

  findAllByUserId: function (req, res) {
    // Get all of the email addresses registered to a particular userID
    UserEmail.findByUserId(req.user[0].id, function (err, emails) {
      if (err) { return res.send(400, { message: 'Error looking up emails.' }); }
      return res.send(emails);
    });
  },

  create: function (req, res) {
    // create a new email address entry, but first check that it isn't registered
    // to another user
    var e = _.extend(req.body || {}, req.params);
    UserEmail.findOne({ where: { email: e.email }}, function (err, email) {
      if (err) { return res.send(400, { message: 'Error looking up email address.' }); }
      if (email) {
        if (email.userId == req.user[0].id) {
          return res.send(400, { message: 'Email address already registered.' });
        }
        else {
          return res.send(400, { message: 'Email address already registered by another person.' });
        }
      }
      UserEmail.create(e, function (err, newE) {
        if (err) { return res.send(400, { message: 'Error registering email address.' }); }
        return res.send(newE);
      });
    });
  }
};

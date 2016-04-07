/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var validator = require('validator');

module.exports = {
	/**
	 * Check if a given username already exists
	 *
	 * @params :id of the username to test, eg:
	 *         user/username/:id such as user/username/foo
	 * @return true if the username is taken (can't be used),
	 *         false if the username is available
	 */
	username: function (req, res) {
		// don't allow empty usernames
		if (!req.route.params.id) {
			return res.send(true);
		}

		// only allow email usernames, so check if the email is valid
		if (validator.isEmail(req.route.params.id) !== true) {
			return res.send(true);
		}
		// check if a user already has this email
		User.findOneByUsername(req.route.params.id.toLowerCase(), function (err, user) {
			if (err) { return res.send(400, { message:'Error looking up username.' }); }
			if (!user) { return res.send(false); }
			// TODO: why is this checking if user is logged in?
			if (req.user && req.user[0].id == user.id) { return res.send(false); }
			return res.send(true);
		});
	},

};

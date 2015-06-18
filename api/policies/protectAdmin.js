/**
* Only Admins should be able to set the isAdmin property of the model.
*/
module.exports = function protectAdmin (req, res, next) {
	delete req.body.isAdmin;
	next();
};

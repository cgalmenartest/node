/**
 * MainController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
	find: function(req, res) {
    res.view('main/index');
	}
}
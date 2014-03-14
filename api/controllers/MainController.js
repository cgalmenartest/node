/**
 * MainController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
	find: function(req, res) {
    res.view('main/index');
	},
	test: function(req, res) {
		res.json({"users":[{"id":"1234","fullname":"Daniel Kottke","email":"KottkeDP@state.gov","image":"http:\/\/corridor.state.gov\/wp-content\/uploads\/avatars\/1234\/cfc519cba6a87eb3f8a3396b6b330cbd-bpfull.jpg","phone":null,"agency":null,"office":null,"title":null,"position":"Technical New Media Advisor \/ Web Developer\r\n","location":null,"languages":[{"language":"Japanese","speaking":"1","reading":"1"},{"language":"French","speaking":"1","reading":"1"}],"proftags":{"tags":["New Media","Design","Software Development","User Experience (UX)","Software Architecture"]},"skills":{"tags":["WordPress","PHP: Hypertext Preprocessor (php)","Java","Microsoft SQL Server","Microsoft .NET Framework","User Experience (UX)","Software Architecture","Database Architecture"]},"career":null,"education":null,"perstags":{"tags":["Music","Reading","Philosophy","Mathematics","Gaming","Audio Recording","Coding"]}}],"status":"ok","response_timestamp":1394723697});
	}
}
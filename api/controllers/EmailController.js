/**
 * EmailController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling email requests.
 */
module.exports = {
	test: function(req, res){
		return res.send('hi');
	},
	makeURL: function(req, res){
		var href = 'mailto:';
		var fields = _.extend({}, sails.services.utils.emailTemplate['generateEmailLocals'](req.query.email));
		for(property in req.query){
			if(property !== 'email')
			{
				if(property in sails.config.emailTemplates.emailTemplates.templates[req.query.email].fields){
					fields.templateLocals[property] = req.query[property]
				}
				else{
					fields[property] = req.query[property];
				}
			}
		}
		sails.services.utils['emailTemplate'].prepareLayout(
		fields.layout,
		fields.layoutLocals,
		fields.template,
		fields.templateLocals,
		function(err, html, text){
			if (err) { return res.send(400, { message: 'Error generating email.' }); }
			href = href + (fields.to ? fields.to : '') + '?' +
						'subject=' + fields.subject + '&' +
						'body=' + text ;
			return res.send(href);
		});
	}
};
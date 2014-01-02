var util 						= require("util");
var events 					= require("events");
var _ 							= require('underscore');
var async 					= require('async');
var emailTemplates 	= require('email-templates');

function prepareTemplate(dir, name, locals, cb){
	emailTemplates(dir, function(err, template){
		if (!err) {
		  template(name, locals, cb);
		}
		else{
			cb(err, null, null);
		}
	});
}

function prepareLayout(layout, layoutLocals, content, contentLocals, cb){
	var contentRender = prepareTemplate(sails.config.emailTemplateDirectories.templateDir, content, contentLocals, function(err, innerHTML, innerText){
		if(!err){
			// get rid of newline characters
			var newlineReg = /\r?\n|\r/gi ;
			// strip out external html and body tags from inner portion, as the layout will add these
			var reg = /<body[^>]*>(.*?)<\/body>/i ;
			innerHTML = innerHTML.replace(newlineReg, ' ');
			var matchArr = innerHTML.match(reg);
			if(matchArr && matchArr.length > 1) innerHTML = matchArr[1];
			layoutLocals.contentHTML = innerHTML;
			layoutLocals.contentText = innerText;
			prepareTemplate(sails.config.emailTemplateDirectories.layoutDir, layout, layoutLocals, cb);
		}
		else {
			cb(err, null, null);
		}
	});
}

function verifyTemplate(type, template, locals){
	sails.services.utils.lib['validateFields'](
		locals,
		sails.config.emailTemplates.emailTemplates[type][template].fields
	);
}

function generateEmailLocals (email){
	return sails.config.emailTemplates.emails[email];
}

module.exports = {
	prepareTemplate: prepareTemplate,
	prepareLayout: prepareLayout,
	verifyTemplate: verifyTemplate,
	generateEmailLocals: generateEmailLocals
};
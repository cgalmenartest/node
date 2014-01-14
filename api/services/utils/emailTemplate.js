var util 						= require("util");
var events 					= require("events");
var _ 							= require('underscore');
var async 					= require('async');
var emailTemplates 	= require('email-templates');

// This is the core function for mixing-in local vars into a template's html/text files and returning them
function prepareTemplate(dir, name, locals, cb){
	emailTemplates(dir, function(err, template){
		if (!err) {
			// this returns err, html, text
		  template(name, locals, cb);
		}
		else{
			cb(err, null, null);
		}
	});
}
// call prepareTemplate on content first, then ready this content as a local variable of the outer layout, then call prepare template on layout
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
// validate that local variables are valid for given template
function verifyTemplate(type, template, locals){
	sails.services.utils.lib['validateFields'](
		locals,
		sails.config.emailTemplates.emailTemplates[type][template].fields
	);
}
// convenience function to return default global local variables for template
function generateEmailLocals (email){
	return sails.config.emailTemplates.emails[email];
}

module.exports = {
	prepareTemplate: prepareTemplate,
	prepareLayout: prepareLayout,
	verifyTemplate: verifyTemplate,
	generateEmailLocals: generateEmailLocals
};
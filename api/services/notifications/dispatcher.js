/**
 * Source definition for
 *
 * @module    :: Source
 * @description ::
 */
 var util 					= require("util");
 var events 				= require("events");
 var _ 							= require('underscore');
 var async 					= require('async');
 var nodemailer     = require('nodemailer');

function transport(){
	var smtp = sails.config.smtp;
	var configs = {
		service: smtp.service,
		host: smtp.host, // hostname
		secureConnection: smtp.secureConnection, // use SSL
		port: smtp.port, // port for secure SMTP
		auth: {
	    user: smtp.auth.user,
	    pass: smtp.auth.pass
	  },
	  ignoreTLS: smtp.ignoreTLS,
	  debug: smtp.debug,
	  maxConnections: smtp.maxConnections
 	};
	return nodemailer.createTransport("SMTP", configs);
}

function send(locals, html, text, cb){
  transport().sendMail(
  {
    from: locals.from,
    to: locals.to,
    subject: locals.subject,
    html: html,
    text: text
  },
  cb);
}

module.exports = {
	sendSimpleEmail: function(fields, settings, cb){
		sails.services.utils['emailTemplate'].prepareLayout(
		fields.layout,
		fields.layoutLocals,
		fields.template,
		fields.templateLocals,
		function(err, html, text){
			if(err){ console.log(err); cb(null, null); return false;}
			if(fields.to && fields.from){
				send(
				{
					to: fields.to,
					subject: fields.subject,
					from: fields.from
				},
				html, text, cb);
			}
			else{
				cb(null, null);
			}
		});
	},
	bypass: function(fields, settings, cb){
		cb(null, null);
	},
	sendSimpleMessage: function(fields, settings, cb){
		cb(null, null);
	}
}
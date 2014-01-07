/**
 * Notification system: subsytem for dispatching events
 *
 * @module    :: Source
 * @description ::
 */
var util           = require('util');
var events         = require('events');
var _              = require('underscore');
var async          = require('async');
var nodemailer     = require('nodemailer');

// configure settings for email and generate nodemailer "transport" object
function transport () {
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
};

// dispatch the email
function send (locals, html, text, cb) {
  transport().sendMail(
  {
    from: locals.from,
    to: locals.to,
    subject: locals.subject,
    html: html,
    text: text
  },
  cb);
};

module.exports = {
  // send an email with basic email properties
  sendSimpleEmail: function (fields, settings, cb) {
    sails.services.utils['emailTemplate'].prepareLayout(
    fields.layout,
    fields.layoutLocals,
    fields.template,
    fields.templateLocals,
    function(err, html, text){
      if(err){ sails.log.debug(err); cb(null, null); return false;}
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

  // do nothing
  bypass: function (fields, settings, cb) {
    cb(null, null);
  },

  sendSimpleMessage: function (fields, settings, cb) {
    cb(null, null);
  }
};

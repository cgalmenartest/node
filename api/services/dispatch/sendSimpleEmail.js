/**
 * Notification system: subsytem for dispatching events
 *
 * @module    :: Source
 * @description ::
 */
var _              = require('underscore');
var nodemailer     = require('nodemailer');

// configure settings for email and generate nodemailer "transport" object
function transport () {
  var configs = sails.config[sails.config.emailProtocol.toLowerCase()];
  return nodemailer.createTransport(sails.config.emailProtocol, configs);
};

// dispatch the email
function send (locals, html, text, cb) {
  var t = transport();
  if(sails.config.dkimEnabled)
  {
    t.useDKIM(sails.config.dkim);
  }
  t.sendMail(
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
  execute: function (fields, settings, cb) {
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
  }
};

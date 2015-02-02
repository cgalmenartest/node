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
  sails.log.debug('send: locals',locals)
  sails.log.debug('send: text', text)
  var t = transport();
  if (sails.config.dkimEnabled)
  {
    t.useDKIM(sails.config.dkim);
  }
  t.sendMail(
  {
    from: locals.from,
    to: locals.to,
    cc: _.compact([locals.cc, sails.config.notificationsCC]),
    bcc: _.compact([locals.bcc, sails.config.notificationsBCC]),
    subject: locals.subject,
    html: html,
    text: text
  }, function(err, info) {
       if (err) sails.log.debug('Failed to send mail. If this is unexpected, please check your email configuration in config/local.js.');
       cb(err, info);
     });
};

module.exports = {
  // send an email with basic email properties
  execute: function (fields, settings, cb) {
    sails.services.utils['emailTemplate'].prepareLayout(
      fields,
      function (err, html, text) {
        // sails.log.debug("Email Fields", fields);
        // sails.log.debug("Email Settings", settings);
        // sails.log.debug("Email Metadata", fields.metadata);
        if (err) {
          sails.log.debug(err);
          cb(null, null);
          return;
        }
        if (fields.to && fields.from) {
          send(
          {
            to: fields.to,
            cc: fields.cc,
            bcc: fields.bcc,
            subject: fields.subject,
            from: fields.from
          },
          html, text, cb);
        }
        else{
          cb(null, null);
        }
      }
    );
  }
};

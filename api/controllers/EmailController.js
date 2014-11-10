/**
 * EmailController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling email requests. This will generate href strings.
 */
module.exports = {
  makeURL: function(req, res){
    var href = 'mailto:';
    // get global defaults for the email template passed in under the "email" key in query string
    var fields = _.extend({}, sails.services.utils.emailTemplate['generateEmailLocals'](req.query.email));
    for (property in req.query) {
      if (property !== 'email') {
        fields.templateLocals[property] = req.query[property];
      }
    }
    // call layout generator function to produce the text for the href string
    sails.services.utils['emailTemplate'].prepareLayout(
      fields,
      function (err, html, text) {
        text = encodeURIComponent(text);
        if (err) { return res.send(400, { message: 'Error generating email.' }); }
        // href string to be returned
        href = href + (fields.to ? fields.to : '') + '?' +
              'subject=' + fields.subject + '&' +
              'body=' + text ;
        return res.send(href);
      }
    );
  }
};

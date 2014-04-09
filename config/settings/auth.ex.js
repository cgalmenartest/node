// import login configuration
var config = require('../../assets/js/backbone/config/login.json');
module.exports = {
  // AUTHENTICATION SETTINGS
  // Set your client ids private keys for each of your services
  auth: {
    linkedin : {
      clientId    : process.env.LINKEDIN_CLIENT_ID  || 'CLIENT_ID',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'CLIENT_SECRET',
      callbackUrl : process.env.LINKEDIN_CALLBACK_URL || 'http://localhost/api/auth/callback/linkedin'
    },
    myusa : {
      clientId    : process.env.MYUSA_CLIENT_ID  || 'CLIENT_ID',
      clientSecret: process.env.MYUSA_CLIENT_SECRET || 'CLIENT_SECRET',
      callbackUrl : process.env.MYUSA_CALLBACK_URL || 'http://localhost/api/auth/myusa/callback'
    },
    sspi : {
      contentUrl  : 'http://localhost:1337/api/main/test',
      emailDomain : 'state.gov',
      header      : 'x_remote_user',
      globalPass  : 'AbAbAb12!@',
      enabled   : false
    }
  },
  // Pass the login.json config object to sails
  config: config
};

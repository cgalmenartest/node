 module.exports = {
  // AUTHENTICATION SETTINGS
  // Set your client ids private keys for each of your services
  auth: {
    linkedin : {
      clientId    : process.env.LINKEDIN_CLIENT_ID  || 'CLIENT_ID',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'CLIENT_SECRET'
    },
    myusa : {
      clientId    : process.env.MYUSA_CLIENT_ID  || 'CLIENT_ID',
      clientSecret: process.env.MYUSA_CLIENT_SECRET || 'CLIENT_SECRET'
    }
  }
};

/**
 * This is a configuration file that defines the login
 * options available in the login backbone app
 */
define({
  // The OAuth providers enabled for this application
  oauth: [
  {
    'name': 'LinkedIn',
    'image': '/images/login/linkedin.png',
    'endpoint': '/api/auth/linkedin'
  },
  {
    'name': 'MyUSA',
    'image': '/images/login/myusa.png',
    'endpoint': '/api/auth/myusa'
  }
  ],
  // should local username/password logins be allowed?
  // set to true to allow username/password
  local: true
});

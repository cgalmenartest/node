module.exports = {
  // used if no other user is specified
  'defaultUser': {
    'username': 'tester1@midascrowd.com',
    'password': 'TestTest123#'
  },
  // for the user.test.js suite
  'testUser': {
    'username': 'testuser@midascrowd.com',
    'password': 'MidasTestM4$'
  },
  // for the admin test suite
  'adminUser': {
    'username': 'admin@midascrowd.com',
    'password': 'Adm1nTest123$#'
  },
  'testPasswordResetUser': {
    'username': 'testreset@midascrowd.com',
    'password': 'Test123$',
    'newpassword': 'FooBar123#'
  },
  'url': 'http://localhost:1337/api',
  'sails': {
      log: {
        level: 'error'
      },
      adapters: {
        'default': 'disk'
      }
    },
  'project': {
    'title': 'Project Title',
    'description': 'Project Description'
  },
  'tags': [
    {
      'type': 'skill',
      'name': 'Tag1'
    },
    {
      'type': 'skill',
      'name': 'Tag2'
    },
    {
      'type': 'office',
      'name': 'Tag3'
    }
  ]
};

module.exports = {
  'username': 'tester1@midascrowd.com',
  'password': 'TestTest123#',
  // for the user.test.js suite
  'testUser': {
    'username': 'testuser@midascrowd.com',
    'password': 'MidasTestM4$'
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

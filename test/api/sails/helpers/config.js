module.exports = {
  'username': 'foo',
  'password': 'bar',
  'url': 'http://localhost:1337',
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

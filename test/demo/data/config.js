module.exports = {
  url: 'http://localhost:1337',
  users: {
    'tyrion': {
      name: 'Tyrion Lannister',
      username: 'tyrion',
      password: 'tyrion',
      photo: 'assets/users/tyrion.jpg'
    },
    'arya': {
      name: 'Arya Stark',
      username: 'arya',
      password: 'arya',
      photo: 'assets/users/arya.jpg'
    },
    'danny': {
      name: 'Daenerys Targaryen',
      username: 'danny',
      password: 'danny',
      photo: 'assets/users/danny.jpg'
    },
    'ned': {
      name: 'Eddard Stark',
      username: 'ned',
      password: 'ned',
      photo: 'assets/users/ned.jpg'
    },
  },
  projects: [
    {
      state: 'public',
      title: 'Robert\'s Rebellion',
      description: 'Robert\'s Rebellion was a civil war amongst the Great Houses of Westeros that took place approximately seventeen years before the TV series began, and lasted about one year. It displaced the royal House Targaryen and saw most of its members wiped out, with only two survivors who fled into exile across the sea. House Baratheon became the new royal house after the war\'s conclusion.',
      cover: 'assets/projects/roberts_rebellion.png',
      owners: ['ned'],
      comments: [],
      events: [],
      tasks: []
    }
  ]
};

module.exports = {
  url: 'http://localhost:1337/api',
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
      title: 'Youngest daughter of Eddard Stark',
      company: 'House Stark',
      photo: 'assets/users/arya.jpg'
    },
    'danny': {
      name: 'Daenerys Targaryen',
      username: 'danny',
      password: 'danny',
      title: 'Mother of Dragons',
      company: 'House Targaryen',
      photo: 'assets/users/danny.jpg'
    },
    'ned': {
      name: 'Eddard Stark',
      username: 'ned',
      password: 'ned',
      title: 'Lord of Winterfell and Warden of the North',
      company: 'House Stark',
      photo: 'assets/users/ned.jpg'
    },
  },
  projects: [
    {
      state: 'public',
      title: 'Robert\'s Rebellion',
      description: 'Robert\'s Rebellion was a civil war amongst the Great Houses of Westeros that took place approximately seventeen years before the TV series began, and lasted about one year. It displaced the royal House Targaryen and saw most of its members wiped out, with only two survivors who fled into exile across the sea. House Baratheon became the new royal house after the war\'s conclusion.',
      cover: 'assets/projects/roberts_rebellion.png',
      owner: 'ned',
      owners: [],
      comments: [
        {
          topic: true,
          user: 'arya',
          value: 'Swift as a deer. Quiet as a shadow. Fear cuts deeper than swords. Quick as a snake. Calm as still water.',
          children: [
            {
              user: 'ned',
              value: 'Winter is coming.'
            }
          ]
        },
        {
          topic: true,
          user: 'ned',
          value: 'The man who passes the sentence should swing the sword. ',
          children: [
            {
              user: 'arya',
              value: 'He\'s just stupid. He likes to polish helmets and beat on swords with hammers.'
            }
          ]
        }
      ],
      events: [],
      tasks: []
    }
  ]
};

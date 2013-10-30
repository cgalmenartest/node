module.exports = {
  user: {
    username: 'initialize',
    password: 'initialize'
  },
  tags: [
    {
      type: 'time-required',
      name: 'Part Time'
    },
    {
      type: 'time-required',
      name: 'Full Time'
    },
    {
      type: 'time-required',
      name: '20% Time'
    },
    // ------------
    {
      type: 'people',
      name: '1 person'
    },
    {
      type: 'people',
      name: '2 - 5 people'
    },
    {
      type: 'people',
      name: '> 5 people'
    },
    {
      type: 'people',
      name: 'A Team'
    },
    // ------------
    {
      type: 'skills-required',
      name: 'Skills Required'
    },
    {
      type: 'skills-required',
      name: 'Skills Not Required'
    },
    // ------------
    {
      type: 'length',
      name: '1 Day'
    },
    {
      type: 'length',
      name: '1 - 3 Days'
    },
    {
      type: 'duty-length',
      name: '1 Week'
    },
    {
      type: 'length',
      name: '1 Month'
    },
    {
      type: 'length',
      name: 'A Few Months'
    }
  ]
};

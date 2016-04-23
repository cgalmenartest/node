var tags = {
  oneTime: {
    name: 'One time',
    type: 'task-time-required'
  },
  ongoing: {
    name: 'Ongoing',
    type: 'task-time-required'
  }
};

module.exports = {
  'draft': {
    state: 'draft',
    title: '',
    description: '',
    userId: 1,
    publishedAt: '2015-05-08T21:45:55.823Z',
    createdAt: '2015-05-08T21:45:55.823Z',
    updatedAt: '2015-05-08T21:45:55.823Z',
  },
  'submitted': {
    state: 'submitted',
    title: '',
    description: '',
    userId: 1,
    publishedAt: '2015-05-08T21:45:55.823Z',
    createdAt: '2015-05-08T21:45:55.823Z',
    updatedAt: '2015-05-08T21:45:55.823Z',
  },
  'open': {
    state: 'open',
    title: 'Validate USDA Data',
    description: 'Some addresses in the USDA Meat & Poultry Inspection Directory need validating and correcting to ensure they can be leveraged for geospatial mapping. You will determine if the address is suitable for mapping or mailing. Get a quick intro to geo-spatial analysis and help make food inspection more efficient.',
    userId: 1,
    publishedAt: '2015-05-08T21:45:55.823Z',
    createdAt: '2015-05-08T21:45:55.823Z',
    updatedAt: '2015-05-08T21:45:55.823Z',
  },
  'assigned': {
    state: 'assigned',
    title: 'Assigned Task',
    description: 'description of the assigned task',
    userId: 1,
    publishedAt: '2015-05-08T21:45:55.823Z',
    createdAt: '2015-05-08T21:45:55.823Z',
    updatedAt: '2015-05-08T21:45:55.823Z',
  },
  'completed': {
    state: 'completed',
    title: 'Completed Task',
    description: 'description of the completed task',
    userId: 1,
    publishedAt: '2015-05-08T21:45:55.823Z',
    createdAt: '2015-05-08T21:45:55.823Z',
    updatedAt: '2015-05-08T21:45:55.823Z',
  },
  'archived': {
    state: 'archived',
    title: 'Archived Task',
    description: 'description of the archived task',
    userId: 1,
    publishedAt: '2015-05-08T21:45:55.823Z',
    createdAt: '2015-05-08T21:45:55.823Z',
    updatedAt: '2015-05-08T21:45:55.823Z',
  },
  'oneTime': {
    title: 'Fake one time task',
    tags: [tags.oneTime]
  },
  'anotherTime': {
    title: 'Second fake one time task',
    tags: [tags.oneTime]
  },
  'ongoing': {
    title: 'Fake ongoing task',
    tags: [tags.ongoing]
  },
  'anotherOngoing': {
    title: 'Second fake ongoing task',
    tags: [tags.ongoing]
  }



}

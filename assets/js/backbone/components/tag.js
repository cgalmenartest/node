/**
 * This is a configuration file that defines the standard
 * tags for this installation.  The tags will be displayed
 * in the order of the array.
 */
define({
  // This defines all of the tag elements for use in the app
  tags: {
    skill: {
      'icon': 'icon-atom',
      'class': 'skill',
      'id': 'skill',
      'type': 'skill',
      'name': 'Skill',
      'plural': 'Skills'
    },
    topic: {
      'icon': 'icon-briefcase',
      'class': 'topic',
      'id': 'topic',
      'type': 'topic',
      'name': 'Topic',
      'plural': 'Topics'
    },
    agency: {
      'icon': 'icon-library',
      'class': 'agency',
      'id': 'agency',
      'type': 'agency',
      'name': 'Agency',
      'plural': 'Agencies'
    },
    location: {
      'icon': 'icon-map-marker',
      'class': 'location',
      'id': 'location',
      'type': 'location',
      'name': 'Location',
      'plural': 'Locations'
    }
    // add task tags here
  },
  // This defines the part of the app and which tags apply
  // plural names are for searching the collection
  // singular names are for the individual show views
  projects: ['skill', 'topic', 'agency', 'location'],
  project: ['skill', 'topic', 'agency', 'location'],
  profiles: ['skill', 'topic', 'agency', 'location'],
  profile: ['skill', 'topic'],
  tasks: ['skill', 'topic', 'agency', 'location'],
  task: ['skill', 'topic']
});

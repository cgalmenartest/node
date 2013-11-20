/**
 * This is a configuration file that defines the standard
 * tags for this installation.  The tags will be displayed
 * in the order of the array.
 */
define({
  // This defines all of the tag elements for use in the app
  tags: {

    'skill': {
      'icon': 'icon-atom',
      'class': 'skill',
      'id': 'skill',
      'type': 'skill',
      'name': 'Skill',
      'plural': 'Skills'
    },

    'topic': {
      'icon': 'icon-briefcase',
      'class': 'topic',
      'id': 'topic',
      'type': 'topic',
      'name': 'Topic',
      'plural': 'Topics'
    },

    'agency': {
      'icon': 'icon-library',
      'class': 'agency',
      'id': 'agency',
      'type': 'agency',
      'name': 'Agency',
      'plural': 'Agencies'
    },

    'location': {
      'icon': 'icon-map-marker',
      'class': 'location',
      'id': 'location',
      'type': 'location',
      'name': 'Location',
      'plural': 'Locations'
    },

    // ---
    // Task-specific tags
    // ---
    'task-skills-required': {
      'icon': 'icon-map-marker',
      'class': 'task-skills-required',
      'id': 'task-skills-required',
      'type': 'task-skills-required',
      'name': 'Skill Required',
      'plural': 'Skills Required'
    },

    'task-time-required': {
      'icon': 'icon-map-marker',
      'class': 'task-time-required',
      'id': 'task-time-required',
      'type': 'task-time-required',
      'name': 'Time Required',
      'plural': 'Time Required'
    },

    'task-people': {
      'icon': 'icon-map-marker',
      'class': 'task-people',
      'id': 'task-people',
      'type': 'task-people',
      'name': 'Person',
      'plural': 'People'
    },

    'task-length': {
      'icon': 'icon-map-marker',
      'class': 'task-length',
      'id': 'task-length',
      'type': 'task-length',
      'name': 'Length',
      'plural': 'Length'
    },

    'task-time-estimate': {
      'icon': 'icon-map-marker',
      'class': 'task-time-estimate',
      'id': 'task-time-estimate',
      'type': 'task-time-estimate',
      'name': 'Time Estimate',
      'plural': 'Time Estimate'
    }

  },

  // This defines the part of the app and which tags apply
  // plural names are for searching the collection
  // singular names are for the individual show views.
  project   : ['skill', 'topic', 'agency', 'location'],
  projects  : ['skill', 'topic', 'agency', 'location'],

  profile   : ['skill', 'topic'],
  profiles  : ['skill', 'topic', 'agency', 'location'],

  task      : ['skill', 'topic', 'task-skills-required', 'task-time-required', 'task-people', 'task-length', 'task-time-estimate'],
  tasks     : ['skill', 'topic', 'agency', 'location', 'task-skills-required', 'task-time-required', 'task-people', 'task-length', 'task-time-estimate']
});

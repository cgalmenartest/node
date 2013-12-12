 module.exports = {
  // NOTIFICATION SETTINGS
  // Set the sources of externally linked data/files
  // notifications: {
  //   'directUserEmailRequestFromCard': {
  //     type: 'model',
  //     target: 'Project',
  //     fields: [
  //       {
  //         name: 'title',
  //         where: { state: 'public' }
  //       }
  //     ]
  //   }
  // },

  userGroups: {
    'everyone' : {
      populateFunction: 'findAllUsers'
    },
    'user' : {
      populateFunction: 'findUser'
    },
    'projectOwners' : {
      populateFunction: 'findProjectOwners'
    },
    'projectParticipants' : {
      populateFunction: 'findProjectParticipants'
    },
    'projectLikers': {
      populateFunction: 'findProjectLikers'
    },
    'projectThreadCommenters': {
      populateFunction: 'findProjectThreadCommenters'
    }
  },

  audience: {
    'globalBlast': ['everyone'],
    'directUserEmailRequestFromCard': ['user'],
    'projectCommentAdded': ['projectOwners', 'projectThreadCommenters'],
    'testAll': ['everyone'],
    'testOne': ['user'],
    'testOwners': ['projectOwners']
  },

  // define the different sorts of notifications based on the data that they contain
  dataAttributeProfiles: {
    'projectOriented':
    {
      fields: ['projectId']
    },
    'taskOriented': {
      fields: ['taskId']
    },
    'userOriented': {
      fields: ['userId']
    },
    'subjectMessage': {
      fields: ['subject']
    },
    'bodyMessage': {
      fields: ['body']
    },
    'email': {
      fields: ['recipientEmail', 'senderEmail', 'mailHeaders']
    },
    'http': {
      fields: ['url', 'requestHeaders', 'verb', 'headerData']
    }

  },

  dataPackages: {
    'globalBlast': ['subjectMessage', 'bodyMessage', 'email'],
    'directUserEmailRequestFromCard': ['subjectMessage', 'bodyMessage', 'email'],
    'projectCommentAdded': ['subjectMessage', 'bodyMessage', 'email'],
    'testAll': ['subjectMessage', 'bodyMessage', 'email'],
    'testOne': ['subjectMessage', 'bodyMessage', 'email'],
    'testOwners': ['subjectMessage', 'bodyMessage', 'email']
  },

  deliveries: {

    'email': {
      frequencies: ['never', 'immediate', 'daily', 'weekly', 'monthly']
    },
    'messages': {
      frequencies: ['never', 'immediate']
    }

  },

  settings: {
    'email': {
      'globalBlast': {
        frequency: 'immediate'
      },
      'directUserEmailRequestFromCard': {
        frequency: 'immediate'
      },
      'projectCommentAdded': {
        frequency: 'immediate'
      },
      'testAll': {
        frequency: 'never'
      },
      'testOne': {
        frequency: 'immediate'
      },
      'testOwners': {
        frequency: 'immediate'
      }

    }


  }


};

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
     'directUserEmailRequestFromCard': ['user'],
     'projectCommentAdded': ['projectOwners', 'projectThreadCommenters'],
     'testAll': ['everyone'],
     'testOne': ['user'],
     'testOwners': ['projectOwners']
   }
 };

module.exports = {
// predefined emails and their default values
  emails: {
    'projectCommentParentReply': {
      layout: 'default',
      template: 'projectCommentParentReply',
      subject: 'Discussion Update',
      from: 'test@midas.com',
      templateLocals: { callerComment: '', parentComment: '', projectTitle: '', projectLink: '' },
      layoutLocals: { footer: 'Brought to you by Midas' }
    },
    'projectCommentOwnerReply': {
      layout: 'default',
      template: 'projectCommentOwnerReply',
      subject: 'Discussion Update',
      from: 'test@midas.com',
      templateLocals: { callerComment: '', parentComment: '', projectTitle: '', projectLink: '' },
      layoutLocals: { footer: 'Brought to you by Midas' }
    },
    'taskCommentParentReply': {
      layout: 'default',
      template: 'taskCommentParentReply',
      subject: 'Discussion Update',
      from: 'test@midas.com',
      templateLocals: { callerComment: '', parentComment: '', taskTitle: '', taskLink: '' },
      layoutLocals: { footer: 'Brought to you by Midas' }
    },
    'taskCommentOwnerReply': {
      layout: 'default',
      template: 'taskCommentOwnerReply',
      subject: 'Discussion Update',
      from: 'test@midas.com',
      templateLocals: { callerComment: '', parentComment: '', taskTitle: '', taskLink: '' },
      layoutLocals: { footer: 'Brought to you by Midas' }
    },
    'taskVolunteerAddedOwnerReply': {
      layout: 'default',
      template: 'taskVolunteerAddedOwnerReply',
      subject: 'Volunteer Added',
      from: 'test@midas.com',
      templateLocals: { taskTitle: '', taskLink: '', profileLink: '', profileTitle: '', profileName: '', profileLocation: '', profileAgency: '' },
      layoutLocals: { footer: 'Brought to you by Midas' }
    },
    'contactUserAboutProject': {
      layout: 'default',
      template: 'contactUserAboutProject',
      subject: 'Take A Look At This Project',
      from: 'test@midas.com',
      templateLocals: { projectLink: '', projectTitle: '', projectDescription: '' },
      layoutLocals: { footer: 'Brought to you by Midas' }
    },
    'contactUserAboutTask': {
      layout: 'default',
      template: 'contactUserAboutTask',
      subject: 'Take A Look At This Opportunity',
      from: 'test@midas.com',
      templateLocals: { opportunityLink: '', opportunityTitle: '', opportunityDescription: '', opportunityMadlibs: '' },
      layoutLocals: { footer: 'Brought to you by Midas' }
    },
    'contactUserAboutProfile': {
      layout: 'default',
      template: 'contactUserAboutProfile',
      subject: 'Take A Look At This Profile',
      from: 'test@midas.com',
      templateLocals: { profileLink: '', profileTitle: '', profileName: '', profileLocation: '', profileAgency: '' },
      layoutLocals: { footer: 'Brought to you by Midas' }
    }
  },
// email templates and the fields they expect
  emailTemplates: {
    'layouts': {
      'default' : {
        name: 'default',
        fields: {
          footer: {
            name: 'footer',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      }
    },
    'templates': {
      'projectCommentParentReply' : {
        name: 'projectCommentParentReply',
        fields : {
          projectLink: {
            name: 'projectLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          projectTitle: {
            name: 'projectTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          callerComment: {
            name: 'callerComment',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          parentComment: {
            name: 'parentComment',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      },
      'projectCommentOwnerReply' : {
        name: 'projectCommentOwnerReply',
        fields : {
          projectLink: {
            name: 'projectLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          projectTitle: {
            name: 'projectTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          callerComment: {
            name: 'callerComment',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          parentComment: {
            name: 'parentComment',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      },
      'taskCommentParentReply' : {
        name: 'taskCommentParentReply',
        fields : {
          taskLink: {
            name: 'taskLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          taskTitle: {
            name: 'taskTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          callerComment: {
            name: 'callerComment',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          parentComment: {
            name: 'parentComment',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      },
      'taskCommentOwnerReply' : {
        name: 'taskCommentOwnerReply',
        fields : {
          taskLink: {
            name: 'taskLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          taskTitle: {
            name: 'taskTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          callerComment: {
            name: 'callerComment',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          parentComment: {
            name: 'parentComment',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      },
      'contactUserAboutProject' : {
        name: 'contactUserAboutProject',
        fields : {
          projectLink: {
            name: 'projectLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          projectTitle: {
            name: 'projectTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          projectDescription: {
            name: 'projectDescription',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      },
      'contactUserAboutTask' : {
        name: 'contactUserAboutTask',
        fields : {
          opportunityLink: {
            name: 'opportunityLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          opportunityTitle: {
            name: 'opportunityTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          opportunityDescription: {
            name: 'opportunityDescription',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          opportunityMadlibs: {
            name: 'opportunityMadlibs',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      },
      'contactUserAboutProfile' : {
        name: 'contactUserAboutProfile',
        fields : {
          profileLink: {
            name: 'profileLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          profileTitle: {
            name: 'profileTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          profileName: {
            name: 'profileName',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          profileLocation: {
            name: 'profileLocation',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          profileAgency: {
            name: 'profileAgency',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      },
      'taskVolunteerAddedOwnerReply' : {
        name: 'taskVolunteerAddedOwnerReply',
        fields : {
          profileLink: {
            name: 'profileLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          profileTitle: {
            name: 'profileTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          profileName: {
            name: 'profileName',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          profileLocation: {
            name: 'profileLocation',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          profileAgency: {
            name: 'profileAgency',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          taskLink: {
            name: 'taskLink',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          taskTitle: {
            name: 'taskTitle',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      }
    }
  }

}
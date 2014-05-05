module.exports = {
// predefined emails and their default values
  emails: {
    'projectCommentParentReply': {
      layout: 'default',
      template: 'commentParentReply',
      subject: '<% if (commentUser.name) { %><%= commentUser.name %><% } else { %>Somebody<% } %> replied to your comment on <%= globals.systemName %>',
      templateLocals: { callerComment: '', parentComment: '', projectTitle: '', projectLink: '' },
      layoutLocals: { }
    },
    'projectCommentOwnerReply': {
      layout: 'default',
      template: 'commentOwnerReply',
      subject: '<%= project.title %> <% if (parentComment) { %>has a new comment<% } else { %>has a new discussion<% } %> on <%= globals.systemName %>',
      templateLocals: { callerComment: '', parentComment: '', projectTitle: '', projectLink: '' },
      layoutLocals: { }
    },
    'taskCommentParentReply': {
      layout: 'default',
      template: 'commentParentReply',
      subject: '<% if (commentUser.name) { %><%= commentUser.name %><% } else { %>Somebody<% } %> replied to your comment on <%= globals.systemName %>',
      templateLocals: { callerComment: '', parentComment: '', taskTitle: '', taskLink: '' },
      layoutLocals: { }
    },
    'taskCommentOwnerReply': {
      layout: 'default',
      template: 'commentOwnerReply',
      subject: '<%= task.title %> <% if (parentComment) { %>has a new comment<% } else { %>has a new discussion<% } %> on <%= globals.systemName %>',
      templateLocals: { callerComment: '', parentComment: '', taskTitle: '', taskLink: '' },
      layoutLocals: { }
    },
    'taskVolunteerAddedOwnerReply': {
      layout: 'default',
      template: 'taskVolunteerAddedOwnerReply',
      subject: '<% if (volunteer.name) { %><%= volunteer.name %><% } else { %>Someone<% } %> has volunteered for <%= task.title %> on <%= globals.systemName %>',
      templateLocals: { taskTitle: '', taskLink: '', profileLink: '', profileTitle: '', profileName: '', profileLocation: '', profileAgency: '' },
      layoutLocals: { }
    },
    'contactUserAboutProject': {
      layout: 'default',
      template: 'contactUserAboutProject',
      subject: 'Take A Look At This Project',
      templateLocals: { projectLink: '', projectTitle: '', projectDescription: '' },
      layoutLocals: { }
    },
    'contactUserAboutTask': {
      layout: 'default',
      template: 'contactUserAboutTask',
      subject: 'Take A Look At This Opportunity',
      templateLocals: { opportunityLink: '', opportunityTitle: '', opportunityDescription: '', opportunityMadlibs: '' },
      layoutLocals: { }
    },
    'contactUserAboutProfile': {
      layout: 'default',
      template: 'contactUserAboutProfile',
      subject: 'Take A Look At This Profile',
      templateLocals: { profileLink: '', profileTitle: '', profileName: '', profileLocation: '', profileAgency: '' },
      layoutLocals: { }
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
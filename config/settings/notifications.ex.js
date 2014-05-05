 // NOTIFICATION SETTINGS
 module.exports = {
  // service functions called to produce the given audience
  audiences : {
    'everyone' : {
      name: 'everyone',
      method: 'findAllUsers',
      fields: {},
      settings: {}
    },
    'user' : {
      name: 'user',
      method: 'findUser',
      fields: {
        'userId' : {
          name: 'userId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    },
    'projectOwners' : {
      name: 'projectOwners',
      method: 'findProjectOwners',
      fields: {
        'projectId' : {
          name: 'projectId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    },
    'projectParticipants' : {
      name: 'projectParticipants',
      method: 'findProjectParticipants',
      fields: {
        'projectId' : {
          name: 'projectId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    },
    'projectLikers' : {
      name: 'projectLikers',
      method: 'findProjectLikers',
      fields: {
        'projectId' : {
          name: 'projectId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    },
    'projectThreadCommenters' : {
      name: 'projectThreadCommenters',
      method: 'findProjectThreadParentCommenters',
      fields: {
        'commentId' : {
          name: 'commentId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    },


    'taskOwners' : {
      name: 'taskOwners',
      method: 'findTaskOwners',
      fields: {
        'taskId' : {
          name: 'taskId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    },
    'taskParticipants' : {
      name: 'taskParticipants',
      method: 'findTaskParticipants',
      fields: {
        'taskId' : {
          name: 'taskId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    },
    'taskLikers' : {
      name: 'taskLikers',
      method: 'findTaskLikers',
      fields: {
        'taskId' : {
          name: 'taskId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    },
    'taskThreadCommenters' : {
      name: 'taskThreadCommenters',
      method: 'findTaskThreadParentCommenters',
      fields: {
        'commentId' : {
          name: 'commentId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {}
    }
  },
  // Defines preflight delivery-building functions
  preflights: {
    'projectCommentReplyParentPrepare': {
      name: 'projectCommentReplyParentPrepare',
      method: 'prepareCommentReplyEmail',
      fields: {
        callerId: {
          name: 'callerId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        },
        recipientId: {
          name: 'recipientId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {
        emailName: 'projectCommentParentReply'
      }
    },
    'projectCommentReplyOwnerPrepare': {
      name: 'projectCommentReplyOwnerPrepare',
      method: 'prepareCommentReplyEmail',
      fields: {
        callerId: {
          name: 'callerId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        },
        recipientId: {
          name: 'recipientId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {
        emailName: 'projectCommentOwnerReply'
      }
    },
    'taskCommentReplyParentPrepare': {
      name: 'taskCommentReplyParentPrepare',
      method: 'prepareCommentReplyEmail',
      fields: {
        callerId: {
          name: 'callerId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        },
        recipientId: {
          name: 'recipientId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {
        emailName: 'taskCommentParentReply'
      }
    },
    'taskCommentReplyOwnerPrepare': {
      name: 'taskCommentReplyOwnerPrepare',
      method: 'prepareCommentReplyEmail',
      fields: {
        callerId: {
          name: 'callerId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        },
        recipientId: {
          name: 'recipientId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }
      },
      settings: {
        emailName: 'taskCommentOwnerReply'
      }
    },
    'taskVolunteerOwnerPrepare': {
      name: 'taskVolunteerOwnerPrepare',
      method: 'prepareTaskVolunteerOwnerEmail',
      fields: {
        callerId: {
          name: 'callerId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        },
        recipientId: {
          name: 'recipientId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        },
        volunteerId: {
          name: 'volunteerId',
          required: true,
          type: 'INTEGER',
          defaultValue: null,
          validation: null
        }

      },
      settings: {
        emailName: 'taskVolunteerAddedOwnerReply'
      }
    },
    'bypass': {
      name: 'bypass',
      method: 'passThrough',
      fields: {},
      settings: {}
    }
  },
// defines delivery functions
  deliveries: {
    'sendSimpleEmail': {
      name: 'sendSimpleEmail',
      method: 'sendSimpleEmail',
      fields: {
        to: {
          name: 'to',
          required: true,
          type: 'STRING',
          defaultValue: null,
          validation: null
        },
        from: {
          name: 'from',
          required: true,
          type: 'STRING',
          defaultValue: null,
          validation: null
        },
        subject: {
          name: 'subject',
          required: true,
          type: 'STRING',
          defaultValue: null,
          validation: null
        },
        layout: {
          name: 'layout',
          required: false,
          type: 'STRING',
          defaultValue: 'default',
          validation: null
        },
        layoutLocals: {
          name: 'layoutLocals',
          required: false,
          type: 'OBJECT',
          defaultValue: {},
          validation: null
        },
        template: {
          name: 'template',
          required: true,
          type: 'STRING',
          defaultValue: 'default',
          validation: null
        },
        templateLocals: {
          name: 'templateLocals',
          required: false,
          type: 'OBJECT',
          defaultValue: {},
          validation: null
        }
      },
      settings: {
        'globalBlast': {
          audience: {
            'everyone': {
              frequency: 'immediate'
            }
          }
        },
        'directUserEmailRequestFromCard': {
          audience: {
            'user': {
              frequency: 'immediate'
            }
          }
        },
        'projectCommentAdded': {
          audience: {
            'projectOwners': {
              frequency: 'immediate'
            },
            'projectThreadCommenters': {
              frequency: 'immediate'
            }
          }
        },
        'taskCommentAdded': {
          audience: {
            'taskOwners': {
              frequency: 'immediate'
            },
            'taskThreadCommenters': {
              frequency: 'immediate'
            }
          }
        },
        'taskVolunteerAdded': {
          audience: {
            'taskOwners': {
              frequency: 'immediate'
            }
          }
        }
      }
    },
    'bypass': {
      name: 'bypass',
      method: 'bypass',
      fields: {},
      settings: {}
    }
  },
  // defines trigger route configuration to respond correctly to action triggers
  triggerRoutes : {
    'globalBlast': {
      audience:{
        'everyone': {
          strategy: {
            'contactEmail': {
              preflight: ['bypass'],
              delivery: 'sendSimpleEmail'
            }
          }
        }
      }
    },
    'directUserEmailRequestFromCard': {
      audience:{
        'user': {
          strategy: {
            'contactEmail': {
              preflight: ['bypass'],
              delivery: 'sendSimpleEmail'
            }
          }
        }
      }
    },
    'projectCommentAdded': {
      audience:{
        'projectOwners': {
          strategy: {
            'contactProjectOwnersOnCommentEmail': {
              preflight: ['projectCommentReplyOwnerPrepare'],
              delivery: 'sendSimpleEmail'
            }
          }
        },
        'projectThreadCommenters': {
          strategy: {
            'contactProjectCommentParentOnCommentEmail': {
              preflight: ['projectCommentReplyParentPrepare'],
              delivery: 'sendSimpleEmail'
            }
          }
        }
      }
    },
    'taskCommentAdded': {
      audience:{
        'taskOwners': {
          strategy: {
            'contactTaskOwnersOnCommentEmail': {
              preflight: ['taskCommentReplyOwnerPrepare'],
              delivery: 'sendSimpleEmail'
            }
          }
        },
        'taskThreadCommenters': {
          strategy: {
            'contactTaskCommentParentOnCommentEmail': {
              preflight: ['taskCommentReplyParentPrepare'],
              delivery: 'sendSimpleEmail'
            }
          }
        }
      }
    },
    'taskVolunteerAdded': {
      audience:{
        'taskOwners': {
          strategy: {
            'contactTaskOwnersOnVolunteerEmail': {
              preflight: ['taskVolunteerOwnerPrepare'],
              delivery: 'sendSimpleEmail'
            }
          }
        }
      }
    }
  }
};

module.exports = {

  emails: {
    'commentUpdate': {
      layout: 'default',
      template: 'commentReply',
      subject: 'Discussion Update',
      from: 'test@midas.com',
      templateLocals: { callerComment: 'test', parentComment: 'test2' },
      layoutLocals: { greeting: 'hi' }
    }
  },
  emailTemplates: {
    'layouts': {
      'default' : {
        name: 'default',
        fields: {
          greeting: {
            name: 'test1',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      }
    },
    'templates': {
      'default' : {
        name: 'default',
        fields : {
          test1: {
            name: 'test1',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          },
          test2: {
            name: 'test2',
            required: true,
            type: 'STRING',
            defaultValue: '',
            validation: null
          }
        }
      },
      'commentReply' : {
        name: 'commentReply',
        fields : {
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
      }
    }
  }

}
console.log('Loading... ', __filename);

/**
 * Policies are simply Express middleware functions which run before your controllers.
 * You can apply one or more policies for a given controller or action.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */


module.exports.policies = {

  // default require authentication
  // see api/policies/authenticated.js
  '*': ['passport', 'authenticated', 'addUserId'],

  // Main rendering controller
  // Passes sspi policy through for auto-login systems
  MainController : {
    '*': ['sspi']
  },

  // Only admins can access the AdminController API
  AdminController : {
    '*': ['passport', 'authenticated', 'admin']
  },

  // Auth controller can be accessed by anyone
  AuthController : {
    '*': true
  },

  UserAuthController: {
    '*': ['passport', 'authenticated', 'requireUserId', 'requireId', 'userAuthIdMatch']
  },

  // Limit user controller view to just the /user endpoint
  UserController : {
    '*': false,
    'profile': ['passport', 'authenticated'],
    'photo': ['passport', 'authenticated', 'requireId'],
    'info': ['passport', 'authenticated', 'requireId'],
    'update': ['passport', 'authenticated', 'requireUserId', 'requireId', 'user', 'protectAdmin'],
    'username': ['passport', 'authenticated'],
    'find': ['passport', 'authenticated', 'requireUserId'],
    'all': ['passport', 'authenticated', 'requireUserId'],
    'findOne': ['passport', 'authenticated', 'requireUserId'],
    'activities': ['passport', 'authenticated'],
    'disable': ['passport', 'authenticated', 'requireId', 'requireUserId'],
    'enable': ['passport', 'authenticated', 'requireId', 'requireUserId', 'admin'],
    'resetPassword': ['passport', 'authenticated', 'requireUserId'],
    'emailCount': ['test'],
    'export': ['passport', 'authenticated', 'admin']
  },

  UserEmailController : {
    '*': ['passport', 'authenticated', 'requireUserId'],
    'find': ['passport', 'authenticated', 'requireUserId', 'requireId', 'userEmailIdMatch'],
    'findOne': ['passport', 'authenticated', 'requireUserId', 'requireId', 'userEmailIdMatch'],
    'findAllByUserId': ['passport', 'authenticated', 'requireUserId', 'requireId', 'user'],
    'create': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'update': ['passport', 'authenticated', 'requireUserId', 'requireId', 'userEmailIdMatch'],
    'destroy': ['passport', 'authenticated', 'requireUserId', 'requireId', 'userEmailIdMatch'],
  },

  UserSettingController : {
    '*': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'find': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'findOne': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'destroy': ['passport', 'authenticated', 'requireUserId', 'requireId','userSettingIdMatch']
  },

  // Disable the index blueprints for FileController due to security concerns
  FileController : {
    'index': false,
    'findAll': 'admin',
    // for testing
    'test': true,
    'testupload': true,
    // everything else is protected
    '*': 'protectedFile'
  },

  ProjectController : {
    '*': ['passport', 'authenticated', 'addUserId', 'project'],
    'find': ['passport', 'authenticated', 'requireId', 'project'],
    'findOne': ['passport', 'authenticated', 'requireId', 'project'],
    'update': ['passport', 'authenticated', 'requireUserId', 'requireId', 'project', 'ownerOrAdmin'],
    'destroy': ['passport', 'authenticated', 'requireUserId', 'requireId', 'project', 'ownerOrAdmin']
  },

  ProjectOwnerController : {
    '*': false,
    'create': ['passport', 'authenticated', 'requireUserId', 'projectId'],
    'destroy': ['passport', 'authenticated', 'requireUserId', 'requireId']
  },

  LikeController : {
    '*': ['passport', 'authenticated', 'addUserId'],
    'count': ['passport', 'authenticated', 'requireId', 'project'],
    'countt': ['passport', 'authenticated', 'requireId', 'task'],
    'countu': ['passport', 'authenticated', 'requireId', 'requireUserId'],
    'like': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'requireId'],
    'liket': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'requireId'],
    'likeu': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'requireId'],
    'unlike': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'requireId'],
    'unliket': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'requireId'],
    'unlikeu': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'requireId'],
    'create': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'destroy': false,
    'update': false
  },

  VolunteerController : {
    '*': false,
    'create': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'destroy': ['passport', 'authenticated', 'requireUserId', 'requireId', 'volunteer', 'ownerOrAdmin'],
  },

  EventController : {
    '*': false,
    'find': ['passport', 'authenticated'],
    'findOne': ['passport', 'authenticated'],
    'create': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'projectId', 'eventUuid'],
    'update': ['passport', 'authenticated', 'requireUserId', 'projectId'],
    'findAllByProjectId': ['passport', 'authenticated', 'addUserId', 'requireId', 'project'],
    'attend': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'requireId'],
    'cancel': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'requireId'],
    'rsvp': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'ical': ['passport', 'authenticated', 'addUserId', 'project'],
    'destroy': ['passport', 'authenticated', 'requireId', 'admin']
  },

  CommentController : {
    'find': false,
    'findOne': false,
    'create': ['passport', 'authenticated', 'requireUserId', 'addUserId', 'projectId', 'taskId'],
    'update': ['passport', 'authenticated', 'requireUserId', 'projectId', 'taskId', 'comment', 'ownerOrAdmin'],
    'destroy': ['passport', 'authenticated', 'requireUserId', 'requireId', 'admin'],
    'findAllByProjectId': ['passport', 'authenticated', 'requireId', 'project'],
    'findAllByTaskId': ['passport', 'authenticated', 'requireId', 'task']
  },

  TagEntityController : {
    // Purely for administrative functions
    '*': ['passport', 'authenticated'],
    'update': ['passport', 'authenticated', 'admin'],
    'destroy': ['passport', 'authenticated', 'admin']
  },

  TaskController : {
    'find': ['passport', 'authenticated', 'task'],
    'findOne': ['passport', 'authenticated', 'task'],
    'findAllByProjectId': ['passport', 'authenticated', 'requireId', 'project'],
    'copy': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'create': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'update': ['passport', 'authenticated', 'requireUserId', 'requireId', 'projectId', 'task', 'ownerOrAdmin'],
    'destroy': ['passport', 'authenticated', 'requireUserId', 'requireId', 'task', 'ownerOrAdmin'],
    'export': ['passport', 'authenticated', 'admin']
  },

  AttachmentController: {
    'find': ['passport', 'authenticated', 'requireId'],
    'findOne': ['passport', 'authenticated', 'requireId'],
    'findAllByProjectId': ['passport', 'authenticated', 'requireId', 'project'],
    'findAllByTaskId': ['passport', 'authenticated', 'requireId', 'task'],
    'create': ['passport', 'authenticated', 'requireUserId', 'addUserId'],
    'update': false,
    'destroy': ['passport', 'authenticated', 'requireUserId']
  },

  SearchController : {
    '*': true
  }

  /*
  // Here's an example of adding some policies to a controller
  RabbitController: {

    // Apply the `false` policy as the default for all of RabbitController's actions
    // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
    '*': false,

    // For the action `nurture`, apply the 'isRabbitMother' policy
    // (this overrides `false` above)
    nurture : 'isRabbitMother',

    // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
    // before letting any users feed our rabbits
    feed : ['isNiceToAnimals', 'hasRabbitFood']
  }
  */
};


/**
 * Here's what the `isNiceToAnimals` policy from above might look like:
 * (this file would be located at `policies/isNiceToAnimals.js`)
 *
 * We'll make some educated guesses about whether our system will
 * consider this user someone who is nice to animals.
 *
 * Besides protecting rabbits (while a noble cause, no doubt),
 * here are a few other example use cases for policies:
 *
 *  + cookie-based authentication
 *  + role-based access control
 *  + limiting file uploads based on MB quotas
 *  + OAuth
 *  + BasicAuth
 *  + or any other kind of authentication scheme you can imagine
 *
 */

/*
module.exports = function isNiceToAnimals (req, res, next) {

  // `req.session` contains a set of data specific to the user making this request.
  // It's kind of like our app's "memory" of the current user.

  // If our user has a history of animal cruelty, not only will we
  // prevent her from going even one step further (`return`),
  // we'll go ahead and redirect her to PETA (`res.redirect`).
  if ( req.session.user.hasHistoryOfAnimalCruelty ) {
    return res.redirect('http://PETA.org');
  }

  // If the user has been seen frowning at puppies, we have to assume that
  // they might end up being mean to them, so we'll
  if ( req.session.user.frownsAtPuppies ) {
    return res.redirect('http://www.dailypuppy.com/');
  }

  // Finally, if the user has a clean record, we'll call the `next()` function
  // to let them through to the next policy or our controller
  next();
};
*/
